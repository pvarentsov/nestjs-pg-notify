import { Module } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PgNotifyClient } from '../pg-notify/pg-notify.client';
import { AppController } from './app.controller';

@Module({
  controllers: [
    AppController,
  ],
  providers: [
    {
      provide: 'PG_NOTIFY_CLIENT',
      useFactory: (): ClientProxy => new PgNotifyClient({
        connection: {
          host: 'localhost',
          port: 5432,
          database: 'pgnotify',
          user: 'pgnotify',
          password: 'pgnotify',
        },
        strategy: {},
      })
    },
  ],
  exports: [
    'PG_NOTIFY_CLIENT',
  ]
})
export class AppModule {}