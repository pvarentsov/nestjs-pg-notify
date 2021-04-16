import { MessagePattern } from '@nestjs/microservices';
import { PG_NOTIFY_TRANSPORT } from './pg-notify.constant';
import { PgNotifyPattern } from './pg-notify.type';

export const PgNotifyEventPattern = <T extends string|Record<string, any>>(metadata: T): MethodDecorator => {
  const pattern: PgNotifyPattern<T> = {
    transport: PG_NOTIFY_TRANSPORT,
    isEvent: true,
    pattern: metadata
  };

  return MessagePattern(pattern);
};

export const PgNotifyMessagePattern = <T extends string|Record<string, any>>(metadata: T): MethodDecorator => {
  const pattern: PgNotifyPattern<T> = {
    transport: PG_NOTIFY_TRANSPORT,
    isEvent: false,
    pattern: metadata
  };

  return MessagePattern(pattern);
};