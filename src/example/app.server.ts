import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

export class AppServer {
  constructor(
    private readonly host: string,
    private readonly port: number,
  ) {}

  public async run(): Promise<void> {
    const app = await NestFactory.create(AppModule);

    await app.listen(this.port,this.host);
    const appURL = await app.getUrl();

    Logger.log(`Server is running on: ${appURL}`, AppServer.name);
  }
}