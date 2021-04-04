import { Logger, LoggerService } from '@nestjs/common';
import { CustomTransportStrategy, Server } from '@nestjs/microservices';
import createSubscriber, { Subscriber } from 'pg-listen';
import { PgNotifyOptions } from './pg-notify.type';

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

  private subscribe(options: PgNotifyOptions): Subscriber {
    const subscriber = createSubscriber(options.connection, {
      retryInterval: options.strategy?.retryInterval,
      retryLimit: options.strategy?.retryLimit,
      retryTimeout: options.strategy?.retryTimeout,
    });

    this.bindEventHandlers(subscriber);

    return subscriber;
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

    subscriber.events.on('reconnect', () => {
      this.loggerService.error('Connection refused', undefined, PgNotifyServer.name);
    });
  }

}