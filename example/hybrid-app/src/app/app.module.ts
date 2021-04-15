import { Module } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PgNotifyClient } from 'nestjs-pg-notify';
import { AppController } from './app.controller';
import { AppToken } from './app.token';

@Module({
  controllers: [
    AppController,
  ],
  providers: [
    {
      provide: AppToken.PgNotifyClient,
      useFactory: (): ClientProxy => new PgNotifyClient({
        connection: {
          host: 'localhost',
          port: 5432,
          database: 'pgnotify',
          user: 'pgnotify',
          password: 'pgnotify',
        },
        strategy: {
          retryInterval: 10_000,
          retryTimeout: Number.POSITIVE_INFINITY,
        },
      })
    },
  ],
  exports: [
    AppToken.PgNotifyClient,
  ]
})
export class AppModule {}