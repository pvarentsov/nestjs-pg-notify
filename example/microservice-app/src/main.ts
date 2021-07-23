import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { PgNotifyServer } from 'nestjs-pg-notify';
import { AppModule } from './app/app.module';

(async (): Promise<void> => {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    strategy: new PgNotifyServer({
      connection: {
        host: 'localhost',
        port: 5432,
        database: 'pgnotify',
        user: 'pgnotify',
        password: 'pgnotify',
      },
      strategy: {
        retryInterval: 1_000,
        retryTimeout: Infinity,
      }
    })
  });

  await app.listen();
})();
