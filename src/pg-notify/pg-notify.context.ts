export class PgNotifyContext {
  private readonly processId: number;
  private readonly channel: string|Record<string, any>;
  private readonly data?: any;
  private readonly requestId?: string;

  constructor(processId: number, channel: string, data?: any, requestId?: string) {
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

  public getRequestId(): string|undefined {
    return this.requestId;
  }
}