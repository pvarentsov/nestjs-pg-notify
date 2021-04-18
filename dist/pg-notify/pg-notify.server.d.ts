import { CustomTransportStrategy, MessageHandler, Server } from '@nestjs/microservices';
import { PgNotifyOptions } from './pg-notify.type';
export declare class PgNotifyServer extends Server implements CustomTransportStrategy {
    private readonly subscriber;
    private readonly loggerService;
    private firstConnected;
    constructor(options: PgNotifyOptions);
    listen(callback: () => void): Promise<void>;
    close(): Promise<void>;
    addHandler(pattern: Record<string, any> | string, callback: MessageHandler): void;
    private createClient;
    private listenChannels;
    private bindMessageHandlers;
    private bindEventHandlers;
    private handleAsEvent;
    private handleAsRequest;
    private getPublisher;
    private parsePayload;
    private getResponse;
}
