export class PgNotifyResponse {
  constructor(
    public readonly status: number|string,
    public readonly data?: any,
    public readonly error?: any
  ) {}

  public static success(data: any, status: number|string = 200): PgNotifyResponse {
    return new PgNotifyResponse(status, data);
  }

  public static error(error: any, status: number|string = 500): PgNotifyResponse {
    return new PgNotifyResponse(status, undefined, error);
  }
}