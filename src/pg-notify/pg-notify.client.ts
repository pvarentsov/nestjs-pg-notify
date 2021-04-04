import { Logger, LoggerService } from '@nestjs/common';
import { ClientProxy, ReadPacket, WritePacket } from '@nestjs/microservices';
import createSubscriber, { Subscriber } from 'pg-listen';
import { PgNotifyOptions } from './pg-notify.type';

export class PgNotifyClient extends ClientProxy {
  private readonly publisher: PgNotifyPublisher;
  private readonly loggerService: LoggerService;

  constructor(options: PgNotifyOptions) {
    super();

    this.loggerService = options.logger || new Logger();
    this.publisher = this.createPublisher(options);
  }

  public async connect(): Promise<void> {
    try {
      await this.publisher.connect();
    }
    catch (error) {
      this.publisher.events.emit('error', error);
    }
  }

  public async close(): Promise<void> {
    try {
      await this.publisher.unlistenAll();
      await this.publisher.close();
    }
    catch (error) {
      this.publisher.events.emit('error', error);
    }
  }

  public async dispatchEvent(packet: ReadPacket): Promise<any> {
    const pattern = this.normalizePattern(packet.pattern);
    await this.publisher.notify(pattern, packet.data);
  }

  public publish(packet: ReadPacket, callback: (packet: WritePacket) => void): () => void {
    return () => undefined;
  }

  private createPublisher(options: PgNotifyOptions): PgNotifyPublisher {
    const subscriber = createSubscriber(options.connection, {
      retryInterval: options.strategy?.retryInterval,
      retryLimit: options.strategy?.retryLimit,
      retryTimeout: options.strategy?.retryTimeout,
    });

    return subscriber;
  }

}

type PgNotifyPublisher = Subscriber;