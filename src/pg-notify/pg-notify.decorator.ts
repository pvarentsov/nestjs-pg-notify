import { MessagePattern } from '@nestjs/microservices';
import { PG_NOTIFY_TRANSPORT } from './pg-notify.constant';
import { PgNotifyPattern } from './pg-notify.type';

export const PgNotifyEventPattern = (metadata: string): MethodDecorator => {
  const pattern: PgNotifyPattern = {
    transport: PG_NOTIFY_TRANSPORT,
    isEvent: true,
    pattern: metadata
  };

  return MessagePattern(pattern);
};

export const PgNotifyMessagePattern = (metadata: Record<string, any>): MethodDecorator => {
  const pattern: PgNotifyPattern<Record<string, any>> = {
    transport: PG_NOTIFY_TRANSPORT,
    isEvent: false,
    pattern: metadata
  };

  return MessagePattern(pattern);
};