export class PgNotifyContext {
  public readonly processId: number;
  public readonly channel: string|Record<string, any>;
  public readonly data?: any;

  constructor(processId: number, channel: string, data?: any) {
    this.processId = processId;
    this.data = data;

    try {
      this.channel = JSON.parse(channel);
    }
    catch (error) {
      this.channel = channel;
    }
  }
}