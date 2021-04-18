export declare class PgNotifyContext {
    private readonly processId;
    private readonly channel;
    private readonly data?;
    private readonly requestId?;
    constructor(processId: number, channel: string, data?: any, requestId?: string);
    getProcessId(): number;
    getChannel(): string | Record<string, any>;
    getData(): any | undefined;
    getRequestId(): string | undefined;
}
