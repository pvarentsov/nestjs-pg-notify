import { Logger } from '@nestjs/common';

export class AppLogger extends Logger {
  public readonly errorMessages: string[] = [];

  public error(message: string): void {
    this.errorMessages.push(message);
  }
}