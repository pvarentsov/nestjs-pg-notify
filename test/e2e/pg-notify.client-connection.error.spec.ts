import { INestApplication, LoggerService } from '@nestjs/common';
import { MicroserviceOptions } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import * as supertest from 'supertest';
import { PgNotifyServer } from '../../src';
import { AppConfig } from './test-app/app.config';
import { AppLogger } from './test-app/app.logger';
import { AppModule } from './test-app/app.module';

describe('E2E: Client Connection (Error)', () => {
  it('When client is not connected, expect it throws connection error on request sending', async () => {
    const clientLogger = new AppLogger();
    const app = await createApp(clientLogger);

    const response = await supertest(app.getHttpServer())
      .post('/send-request')
      .send({});

    const body = response.body;
    await app.close();

    expect(body.status).toEqual(500);
    expect(body.error).toEqual('Client is not connected');
    expect(clientLogger.errorMessages).toEqual(expect.arrayContaining(['Connection refused. Retry attempt 1...']));
  });

  it('When client is not connected, expect it throws connection error on event emitting', async () => {
    const clientLogger = new AppLogger();
    const app = await createApp(clientLogger);

    const response = await supertest(app.getHttpServer())
      .post('/emit-event')
      .send({});

    const body = response.body;
    await app.close();

    expect(body.status).toEqual(500);
    expect(body.error).toEqual('Client is not connected');
    expect(clientLogger.errorMessages).toEqual(expect.arrayContaining(['Connection refused. Retry attempt 1...']));
  });
});

async function createApp(clientLogger: LoggerService): Promise<INestApplication> {
  const module: TestingModule = await Test
    .createTestingModule({
      imports: [
        AppModule.configure({client: {...AppConfig.invalidOptions, logger: clientLogger}})
      ]
    })
    .compile();

  const app = module.createNestApplication();

  app.connectMicroservice<MicroserviceOptions>({
    strategy: new PgNotifyServer(AppConfig.validOptions),
  });

  await app.startAllMicroservicesAsync();
  await app.init();

  return app;
}