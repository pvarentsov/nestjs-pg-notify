export declare class PgNotifyResponse {
    readonly status: number | string;
    readonly data?: any;
    readonly error?: any;
    constructor(status: number | string, data?: any, error?: any);
    static success(data: any, status?: number | string): PgNotifyResponse;
    static error(error: any, status?: number | string): PgNotifyResponse;
}
