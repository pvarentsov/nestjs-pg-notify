import { INestApplication, LoggerService } from '@nestjs/common';
import { MicroserviceOptions } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import * as supertest from 'supertest';
import { PgNotifyServer } from '../../src';
import { AppConfig } from './test-app/app.config';
import { AppLogger } from './test-app/app.logger';
import { AppModule } from './test-app/app.module';

describe('E2E: Server (Error)', () => {
  it('When server is not connected, expect it throws timeout error on request sending', async () => {
    const logger = new AppLogger();
    const app = await createApp(logger);

    const response = await supertest(app.getHttpServer())
      .post('/send-request')
      .send({});

    const body = response.body;
    await app.close();

    expect(body.status).toEqual(500);
    expect(body.error).toEqual('Timeout has occurred');
    expect(logger.errorMessages).toEqual(expect.arrayContaining(['Connection refused. Retry attempt 1...']));
  });

  it('When server is not connected, expect it does not throw any error on event emitting', async () => {
    const logger = new AppLogger();
    const app = await createApp(logger);

    const response = await supertest(app.getHttpServer())
      .post('/emit-event')
      .send({});

    const body = response.body;
    await app.close();

    expect(body).toEqual({});
    expect(logger.errorMessages).toEqual(expect.arrayContaining(['Connection refused. Retry attempt 1...']));
  });
});

async function createApp(logger: LoggerService): Promise<INestApplication> {
  const module: TestingModule = await Test
    .createTestingModule({
      imports: [
        AppModule.configure({client: AppConfig.validOptions})
      ]
    })
    .compile();

  const app = module.createNestApplication();

  app.connectMicroservice<MicroserviceOptions>({
    strategy: new PgNotifyServer({...AppConfig.invalidOptions, logger}),
  });

  await app.startAllMicroservicesAsync();
  await app.init();

  return app;
}