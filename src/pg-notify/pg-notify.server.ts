import { Logger, LoggerService } from '@nestjs/common';
import { CustomTransportStrategy, MessageHandler, Server } from '@nestjs/microservices';
import { NO_EVENT_HANDLER, NO_MESSAGE_HANDLER } from '@nestjs/microservices/constants';
import createSubscriber, { Subscriber } from 'pg-listen';
import { of, Subscription, ConnectableObservable } from 'rxjs';
import { catchError, map, publish } from 'rxjs/operators';
import { PG_NOTIFY_TRANSPORT } from './pg-notify.constant';
import { PgNotifyContext } from './pg-notify.context';
import { PgNotifyResponse } from './pg-notify.response';
import { PgNotifyOptions, PgNotifyPattern } from './pg-notify.type';
import { getReplyPattern, isObject, parseErrorMessage } from './pg-notify.util';

export class PgNotifyServer extends Server implements CustomTransportStrategy {
  private readonly subscriber: Subscriber;
  private readonly loggerService: LoggerService;

  private firstConnected: boolean;

  constructor(options: PgNotifyOptions) {
    super();

    this.loggerService = options.logger || new Logger();
    this.subscriber = this.createClient(options);
    this.firstConnected = false;
  }

  public async listen(callback: () => void): Promise<void> {
    try {
      this.firstConnected = true;

      await this.subscriber.connect();
      await this.listenChannels();

      this.bindMessageHandlers();
    }
    catch (err) {
      this.firstConnected = false;
      this.subscriber.events.emit('error', err);
    }
    finally {
      callback();
    }
  }

  public async close(): Promise<void> {
    try {
      await this.subscriber.unlistenAll();
      await this.subscriber.close();
    }
    catch (err) {
      this.subscriber.events.emit('error', err);
    }
  }

  public addHandler(pattern: Record<string, any>|string, callback: MessageHandler): void {
    if (isObject(pattern) && pattern.transport === PG_NOTIFY_TRANSPORT) {
      super.addHandler((pattern as PgNotifyPattern).pattern, callback, (pattern as PgNotifyPattern).isEvent);
    }
  }

  private createClient(options: PgNotifyOptions): Subscriber {
    const subscriber = createSubscriber(options.connection, {
      retryInterval: options.strategy?.retryInterval,
      retryLimit: options.strategy?.retryLimit,
      retryTimeout: options.strategy?.retryTimeout,
    });

    this.bindEventHandlers(subscriber);

    return subscriber;
  }

  private async listenChannels(): Promise<void> {
    const channels = Array.from(this.messageHandlers.keys());
    await Promise.all(channels.map(channel => this.subscriber.listenTo(channel)));
  }

  private bindMessageHandlers(): void {
    this.subscriber.events.on('notification', async (notification) => {
      const payload = this.parsePayload(notification.payload);
      const ctx = new PgNotifyContext(notification.processId, notification.channel, payload.data, payload.id);

      if (payload.id) {
        return this.handleAsRequest(notification.channel, payload.id, payload.data, ctx);
      }

      return this.handleAsEvent(notification.channel, payload.data, ctx);
    });
  }

  private bindEventHandlers(subscriber: Subscriber): void {
    subscriber.events.on('connected', async () => {
      if (!this.firstConnected) {
        try {
          await this.listenChannels();
          this.bindMessageHandlers();

          this.firstConnected = true;
        }
        catch (err) {
          this.subscriber.events.emit('error', err);
        }
      }
      this.loggerService.log('Connection established', PgNotifyServer.name);
    });

    subscriber.events.on('error', err => {
      const defaultMessage = 'Internal error';
      const message = parseErrorMessage(err) || defaultMessage;

      this.loggerService.error(message, err.stack, PgNotifyServer.name);
    });

    subscriber.events.on('reconnect', attempt => {
      this.loggerService.error(`Connection refused. Retry attempt ${attempt}...`, undefined, PgNotifyServer.name);
    });
  }

  private async handleAsEvent(channel: string, data: any, ctx: PgNotifyContext): Promise<void> {
    const handler = this.getHandlerByPattern(channel);

    if (!handler) {
      return this.loggerService.error(`${NO_EVENT_HANDLER} Event pattern: ${channel}.`, undefined, PgNotifyServer.name);
    }

    try {
      const resolvedHandler = await handler(data, ctx);
      const stream = this
        .transformToObservable(resolvedHandler)
        .pipe(publish()) as ConnectableObservable<any>;

      stream.connect();
    }
    catch (err) {
      return this.loggerService.error(parseErrorMessage(err), undefined, PgNotifyServer.name);
    }
  }

  private async handleAsRequest(channel: string, id: string, data: any, ctx: PgNotifyContext): Promise<Subscription> {
    const handler = this.getHandlerByPattern(channel);
    const publish = this.getPublisher(channel, id);

    if (!handler) {
      const response$ = of(PgNotifyResponse.error(NO_MESSAGE_HANDLER, 404));
      return this.send(response$, publish);
    }

    try {
      const resolvedHandler = await handler(data, ctx);
      const response$ = this.transformToObservable(resolvedHandler).pipe(
        map(res => this.getResponse(res)),
        catchError(err => of(PgNotifyResponse.error(parseErrorMessage(err))))
      );

      return this.send(response$, publish);
    }
    catch (err) {
      const response$ = of(PgNotifyResponse.error(parseErrorMessage(err)));
      return this.send(response$, publish);
    }
  }

  private getPublisher(pattern: string, id: string): (response: any) => Promise<any> {
    return async (response: any): Promise<void> => {
      Object.assign(response, { id });
      await this.subscriber.notify(getReplyPattern(pattern), JSON.stringify(response));
    };
  }

  private parsePayload(payload: any): {id?: string, data: any} {
    const parsedPayload = {id: undefined, data: undefined};

    try {
      const payloadAsObject = JSON.parse(payload);

      if (payloadAsObject.data) {
        parsedPayload.id = payloadAsObject.id;
        parsedPayload.data = payloadAsObject.data;
      }
      else {
        parsedPayload.data = payloadAsObject;
      }
    } catch (err) {
      parsedPayload.data = payload;
    }

    return parsedPayload;
  }

  private getResponse(data: unknown): PgNotifyResponse {
    if (data instanceof PgNotifyResponse) {
      return data;
    }
    return PgNotifyResponse.success(data);
  }
}