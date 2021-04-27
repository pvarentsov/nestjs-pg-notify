import { DynamicModule, Module } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PgNotifyClient, PgNotifyOptions } from '../../../src';
import { AppController } from './app.controller';
import { AppToken } from './app.token';

@Module({})
export class AppModule {
  static configure(options: {client: PgNotifyOptions}): DynamicModule {
    return {
      module: AppModule,
      controllers: [
        AppController,
      ],
      providers: [
        {
          provide: AppToken.PgNotifyClient,
          useFactory: (): ClientProxy => new PgNotifyClient(options.client)
        },
      ],
      exports: [
        AppToken.PgNotifyClient,
      ]
    };
  }
}