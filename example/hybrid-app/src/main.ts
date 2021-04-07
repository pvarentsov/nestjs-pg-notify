import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { PgNotifyServer } from 'nestjs-pg-notify';
import { AppModule } from './app/app.module';

(async (): Promise<void> => {
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
      strategy: {
        retryInterval: 10_000,
        retryTimeout: Number.POSITIVE_INFINITY
      }
    })
  });

  await app.startAllMicroservicesAsync();
  await app.listen(3005);
})();