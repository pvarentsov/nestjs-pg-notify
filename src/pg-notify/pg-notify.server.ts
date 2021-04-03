import { Logger, LoggerService } from '@nestjs/common';
import { CustomTransportStrategy } from '@nestjs/microservices';
import { PgNotifyOptions } from './pg-notify.type';
import createSubscriber, { Subscriber } from 'pg-listen';

export class PgNotifyServer implements CustomTransportStrategy {
  private readonly subscriber: Subscriber;
  private readonly logger: LoggerService;

  constructor(options: PgNotifyOptions) {
    this.logger = options.logger || new Logger();
    this.subscriber = this.subscribe(options);
  }

  public async listen(callback: () => void): Promise<void> {
    try {
      // TODO: Bind message handlers
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
      this.logger.log('Connection established', PgNotifyServer.name);
    });

    subscriber.events.on('error', error => {
      const defaultMessage = 'Internal error';
      const message = error.message || defaultMessage;

      this.logger.error(message, error.stack, PgNotifyServer.name);
    });

    subscriber.events.on('reconnect', () => {
      this.logger.error('Connection refused', undefined, PgNotifyServer.name);
    });
  }

}