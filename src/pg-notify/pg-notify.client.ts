import { Logger, LoggerService, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { ClientProxy, ReadPacket, WritePacket } from '@nestjs/microservices';
import createSubscriber, { PgParsedNotification, Subscriber as Publisher } from 'pg-listen';
import { PgNotifyResponse } from './pg-notify.response';
import { PgNotifyOptions } from './pg-notify.type';
import { getReplyPattern, isObject } from './pg-notify.util';

export class PgNotifyClient extends ClientProxy implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly publisher: Publisher;
  private readonly loggerService: LoggerService;
  private readonly subscriptionsCount: Map<string, number> = new Map();

  private firstConnected: boolean;
  private connected: boolean;

  constructor(options: PgNotifyOptions) {
    super();

    this.loggerService = options.logger || new Logger();
    this.publisher = this.createClient(options);

    this.firstConnected = false;
    this.connected = false;
  }

  public async onApplicationBootstrap(): Promise<void> {
    await this.connectOnBootstrap();
  }

  public async onApplicationShutdown(): Promise<void> {
    await this.close();
  }

  public async connectOnBootstrap(): Promise<void> {
    try {
      this.firstConnected = true;

      await this.publisher.connect();
      this.bindMessageHandlers();
    }
    catch (error) {
      this.firstConnected = false;
      this.publisher.events.emit('error', error as Error);
    }
  }

  public async connect(): Promise<void> {
    if (!this.connected) {
      throw new Error('Client is not connected');
    }
  }

  public async close(): Promise<void> {
    try {
      await this.publisher.unlistenAll();
      await this.publisher.close();
    }
    catch (error) {
      this.publisher.events.emit('error', error as Error);
    }
  }

  public async dispatchEvent(packet: ReadPacket): Promise<any> {
    const pattern = this.normalizePattern(packet.pattern);
    await this.publisher.notify(pattern, packet.data);
  }

  public publish(partialPacket: ReadPacket, callback: (packet: WritePacket) => any): () => any {
    try {
      const packet = this.assignPacketId(partialPacket);
      const pattern = this.normalizePattern(partialPacket.pattern);
      const responseChannel = getReplyPattern(pattern);

      let subscriptionsCount = this.subscriptionsCount.get(responseChannel) || 0;

      const publishPacket = async (): Promise<void> => {
        subscriptionsCount = this.subscriptionsCount.get(responseChannel) || 0;

        this.subscriptionsCount.set(responseChannel, subscriptionsCount + 1);
        this.routingMap.set(packet.id, callback);

        const payload = {id: packet.id, data: packet.data};

        await this.publisher.notify(pattern, JSON.stringify(payload));
      };

      if (subscriptionsCount <= 0) {
        this.publisher.listenTo(responseChannel);
      }

      publishPacket()
        .then()
        .catch(err => callback({err}));

      return (): void => {
        this.unsubscribeFromChannel(responseChannel);
        this.routingMap.delete(packet.id);
      };
    }
    catch (err) {
      return callback({err});
    }
  }

  private createClient(options: PgNotifyOptions): Publisher {
    const client = createSubscriber(options.connection, {
      retryInterval: options.strategy?.retryInterval,
      retryLimit: options.strategy?.retryLimit,
      retryTimeout: options.strategy?.retryTimeout,
    });

    this.bindEventHandlers(client);

    return client;
  }

  private bindMessageHandlers(): void {
    this.publisher.events.on('notification', this.createResponseCallback());
  }

  private bindEventHandlers(publisher: Publisher): void {
    publisher.events.on('connected', () => {
      if (!this.firstConnected) {
        this.bindMessageHandlers();
      }

      this.connected = true;
      this.firstConnected = true;

      this.loggerService.log('Connection established', PgNotifyClient.name);
    });

    publisher.events.on('error', error => {
      const defaultMessage = 'Internal error';
      const message = error.message || defaultMessage;

      this.loggerService.error(message, error.stack, PgNotifyClient.name);
    });

    publisher.events.on('reconnect', attempt => {
      this.connected = false;
      this.loggerService.error(`Connection refused. Retry attempt ${attempt}...`, undefined, PgNotifyClient.name);
    });
  }

  public createResponseCallback(): (notification: PgParsedNotification) => void {
    return (notification: PgParsedNotification): void => {
      const packet = JSON.parse(notification.payload);
      const { err, response, isDisposed, id } = packet;

      const parsedResponse = this.getResponse(response);
      const callback = this.routingMap.get(id);

      if (!callback) return;

      if (isDisposed || err) {
        return callback({err, response: parsedResponse, isDisposed: true});
      }

      return callback({err, response: parsedResponse});
    };
  }

  private unsubscribeFromChannel(channel: string): void {
    const subscriptionCount = this.subscriptionsCount.get(channel);

    if (subscriptionCount) {
      this.subscriptionsCount.set(channel, subscriptionCount - 1);
      if (subscriptionCount - 1 <= 0) {
        this.publisher.unlisten(channel);
      }
    }
  }

  private getResponse(response: unknown): PgNotifyResponse|unknown {
    if (isObject(response) && response.status) {
      return new PgNotifyResponse(response.status, response.data, response.error);
    }

    return response;
  }
}
