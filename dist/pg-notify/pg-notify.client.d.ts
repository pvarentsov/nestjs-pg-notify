import { OnApplicationBootstrap } from '@nestjs/common';
import { ClientProxy, ReadPacket, WritePacket } from '@nestjs/microservices';
import { PgParsedNotification } from 'pg-listen';
import { PgNotifyOptions } from './pg-notify.type';
export declare class PgNotifyClient extends ClientProxy implements OnApplicationBootstrap {
    private readonly publisher;
    private readonly loggerService;
    private readonly subscriptionsCount;
    private firstConnected;
    private connected;
    constructor(options: PgNotifyOptions);
    onApplicationBootstrap(): Promise<void>;
    connectOnBootstrap(): Promise<void>;
    connect(): Promise<void>;
    close(): Promise<void>;
    dispatchEvent(packet: ReadPacket): Promise<any>;
    publish(partialPacket: ReadPacket, callback: (packet: WritePacket) => any): Function;
    private createClient;
    private bindMessageHandlers;
    private bindEventHandlers;
    createResponseCallback(): (notification: PgParsedNotification) => void;
    private unsubscribeFromChannel;
    private getResponse;
}
