import { INestApplication, LoggerService } from '@nestjs/common';
import { MicroserviceOptions } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import * as supertest from 'supertest';
import { PgNotifyServer } from '../../src';
import { AppConfig } from './test-app/app.config';
import { AppLogger } from './test-app/app.logger';
import { AppModule } from './test-app/app.module';
import { AppUtil } from './test-app/app.util';

describe('E2E: Server Reconnection (Success)', () => {

  afterAll(async () => AppUtil.dockerComposeStart());

  it('Expect it reconnects the server', async () => {
    await AppUtil.dockerComposeStop();
    await AppUtil.delay(100);

    const serverLogger = new AppLogger();
    const app = await createApp(serverLogger);

    await AppUtil.dockerComposeStart();
    await AppUtil.delay(1000);

    const response = await supertest(app.getHttpServer())
      .post('/send-request')
      .send({});

    await app.close();

    expect(response.body.status).toEqual(200);
    expect(serverLogger.errorMessages).toEqual(expect.arrayContaining(['Connection refused. Retry attempt 1...']));
    expect(serverLogger.logMessages).toEqual(expect.arrayContaining(['Connection established']));
  });
});

async function createApp(serverLogger: LoggerService): Promise<INestApplication> {
  const clientLogger = new AppLogger();

  const module: TestingModule = await Test
    .createTestingModule({
      imports: [
        AppModule.configure({client: {...AppConfig.validOptions, logger: clientLogger}})
      ]
    })
    .compile();

  const app = module.createNestApplication();

  app.connectMicroservice<MicroserviceOptions>({
    strategy: new PgNotifyServer({...AppConfig.validOptions, logger: serverLogger}),
  });

  await app.startAllMicroservicesAsync();
  await app.init();

  return app;
}