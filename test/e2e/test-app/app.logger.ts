import { Logger } from '@nestjs/common';

export class AppLogger extends Logger {
  public readonly logMessages: string[] = [];
  public readonly errorMessages: string[] = [];

  public log(message: string): void {
    this.logMessages.push(message);
  }

  public error(message: string): void {
    this.errorMessages.push(message);
  }
}