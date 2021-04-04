export class PgNotifyContext {
  private readonly processId: number;
  private readonly channel: string|Record<string, any>;
  private readonly data?: any;
  private readonly requestId?: any;

  constructor(processId: number, channel: string, data?: any, requestId?: any) {
    this.processId = processId;
    this.data = data;
    this.requestId = requestId;

    try {
      this.channel = JSON.parse(channel);
    }
    catch (error) {
      this.channel = channel;
    }
  }

  public getProcessId(): number {
    return this.processId;
  }

  public getChannel(): string|Record<string, any> {
    return this.channel;
  }

  public getData(): any|undefined {
    return this.data;
  }

  public getRequestId(): any|undefined {
    return this.requestId;
  }
}