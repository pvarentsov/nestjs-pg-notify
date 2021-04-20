import { LoggerService } from '@nestjs/common';
import { ConnectionConfig } from 'pg';

export type PgNotifyOptions = {
  /**
   * Corresponds to the "pg" library's connection config
   */
  connection: ConnectionConfig,
  /**
   * Contains retry-strategy config passing the data to the "pg-listen" library
   */
  strategy?: PgNotifyConnectionStrategy,
  /**
   * Overrides default logger
   */
  logger?: LoggerService,
};

export type PgNotifyConnectionStrategy = {
  /**
   * How much time to wait between reconnection attempts (if failed).
   * Can also be a callback returning a delay in milliseconds.
   * Defaults to 500 ms.
   */
  retryInterval?: number | ((attempt: number) => number);
  /**
   * How many attempts to reconnect after connection loss.
   * Defaults to no limit, but a default retryTimeout is set.
   */
  retryLimit?: number;
  /**
   * Timeout in ms after which to stop retrying and just fail. Defaults to 3000 ms.
   */
  retryTimeout?: number;
};

export type PgNotifyPattern<TPattern = string> = {
  transport: string,
  isEvent: boolean,
  pattern: TPattern
};