import { LoggerService } from '@nestjs/common';
import { ConnectionConfig } from 'pg';
export declare type PgNotifyOptions = {
    connection: ConnectionConfig;
    strategy?: PgNotifyConnectionStrategy;
    logger?: LoggerService;
};
export declare type PgNotifyConnectionStrategy = {
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
export declare type PgNotifyPattern<TPattern = string> = {
    transport: string;
    isEvent: boolean;
    pattern: TPattern;
};
