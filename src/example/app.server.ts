import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { PgNotifyServer } from '../pg-notify/pg-notify.server';
import { AppModule } from './app.module';

export class AppServer {
  constructor(
    private readonly host: string,
    private readonly port: number,
  ) {}

  public async run(): Promise<void> {
    const app = await NestFactory.create(AppModule);

    app.connectMicroservice<MicroserviceOptions>({
      strategy: new PgNotifyServer({
        connection: {
          host: 'localhost',
          port: 5432,
          database: 'pgnotify',
          user: 'pgnotify',
          password: 'pgnotify',
        },
        strategy: {},
      })
    });

    await app.startAllMicroservicesAsync();
    await app.listen(this.port,this.host);

    const appURL = await app.getUrl();

    Logger.log(`Server is running on: ${appURL}`, AppServer.name);
  }
}