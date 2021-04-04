import { Logger, LoggerService } from '@nestjs/common';
import { CustomTransportStrategy, MessageHandler, Server } from '@nestjs/microservices';
import createSubscriber, { Subscriber } from 'pg-listen';
import { isObservable } from 'rxjs';
import { PG_NOTIFY_TRANSPORT } from './pg-notify.constant';
import { PgNotifyContext } from './pg-notify.context';
import { PgNotifyOptions, PgNotifyPattern } from './pg-notify.type';
import { isObject } from './pg-notify.util';

export class PgNotifyServer extends Server implements CustomTransportStrategy {
  private readonly subscriber: Subscriber;
  private readonly loggerService: LoggerService;

  constructor(options: PgNotifyOptions) {
    super();

    this.loggerService = options.logger || new Logger();
    this.subscriber = this.subscribe(options);
  }

  public async listen(callback: () => void): Promise<void> {
    try {
      await this.subscriber.connect();
      await this.listenChannels();

      this.bindMessageHandlers();
    }
    catch (error) {
      this.subscriber.events.emit('error', error);
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
    catch (error) {
      this.subscriber.events.emit('error', error);
    }
  }

  public addHandler(pattern: Record<string, any>|string, callback: MessageHandler): void {
    if (isObject(pattern) && pattern.transport === PG_NOTIFY_TRANSPORT) {
      super.addHandler((pattern as PgNotifyPattern).pattern, callback, (pattern as PgNotifyPattern).isEvent);
    }
  }

  private async listenChannels(): Promise<void> {
    const channels = Array.from(this.messageHandlers.keys());
    await Promise.all(channels.map(channel => this.subscriber.listenTo(channel)));
  }

  private subscribe(options: PgNotifyOptions): Subscriber {
    const subscriber = createSubscriber(options.connection, {
      retryInterval: options.strategy?.retryInterval,
      retryLimit: options.strategy?.retryLimit,
      retryTimeout: options.strategy?.retryTimeout,
    });

    this.bindEventHandlers(subscriber);

    return subscriber;
  }

  private bindMessageHandlers(): void {
    this.subscriber.events.on('notification', async (notification) => {
      const handler = this.getHandlerByPattern(notification.channel);

      if (handler) {
        const data = notification.payload;
        const ctx = new PgNotifyContext(notification.processId, notification.channel, data);

        const result = await handler(data, ctx);

        if (isObservable(result)) {
          result.subscribe();
        }
      }
    });
  }

  private bindEventHandlers(subscriber: Subscriber): void {
    subscriber.events.on('connected', () => {
      this.loggerService.log('Connection established', PgNotifyServer.name);
    });

    subscriber.events.on('error', error => {
      const defaultMessage = 'Internal error';
      const message = error.message || defaultMessage;

      this.loggerService.error(message, error.stack, PgNotifyServer.name);
    });

    subscriber.events.on('reconnect', attempt => {
      this.loggerService.error(`Connection refused. Retry attempt ${attempt}...`, undefined, PgNotifyServer.name);
    });
  }

}