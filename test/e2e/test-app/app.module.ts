import { Module } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PgNotifyClient } from '../../../src';
import { AppConfig } from './app.config';
import { AppController } from './app.controller';
import { AppToken } from './app.token';

@Module({
  controllers: [
    AppController,
  ],
  providers: [
    {
      provide: AppToken.PgNotifyClient,
      useFactory: (): ClientProxy => new PgNotifyClient(AppConfig.validOptions)
    },
  ],
  exports: [
    AppToken.PgNotifyClient,
  ]
})
export class AppModule {}