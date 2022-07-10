import { INestApplication, LoggerService } from '@nestjs/common';
import { MicroserviceOptions } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import * as supertest from 'supertest';
import { PgNotifyServer } from '../../src';
import { AppConfig } from './test-app/app.config';
import { AppLogger } from './test-app/app.logger';
import { AppModule } from './test-app/app.module';
import { AppUtil } from './test-app/app.util';

describe('E2E: Client-Server reconnection', () => {

  afterAll(async () => AppUtil.dockerComposeStart());

  it('Expect client and server establish the connection after failed first attempts', async () => {
    await AppUtil.dockerComposeStop();
    await AppUtil.delay(100);

    const serverLogger = new AppLogger();
    const clientLogger = new AppLogger();

    const app = await createApp(serverLogger, clientLogger);

    await AppUtil.dockerComposeStart();
    await AppUtil.delay(1000);

    const response = await supertest(app.getHttpServer())
      .post('/send-request')
      .send({});

    await app.close();

    expect(response.body.status).toEqual(200);

    expect(serverLogger.errorMessages).toEqual(expect.arrayContaining(['Connection refused. Retry attempt 1...']));
    expect(serverLogger.logMessages).toEqual(expect.arrayContaining(['Connection established']));

    expect(clientLogger.errorMessages).toEqual(expect.arrayContaining(['Connection refused. Retry attempt 1...']));
    expect(clientLogger.logMessages).toEqual(expect.arrayContaining(['Connection established']));
  });

  it('Expect client and server establish the connection after losing it', async () => {
    const serverLogger = new AppLogger();
    const clientLogger = new AppLogger();

    const app = await createApp(serverLogger, clientLogger);

    await AppUtil.dockerComposeStop();
    await AppUtil.delay(100);

    await AppUtil.dockerComposeStart();
    await AppUtil.delay(1000);

    const response = await supertest(app.getHttpServer())
      .post('/send-request-with-unified-response')
      .send('42');

    await app.close();

    expect(response.body.status).toEqual(200);

    expect(serverLogger.errorMessages).toEqual(expect.arrayContaining(['Connection refused. Retry attempt 1...']));
    expect(serverLogger.logMessages).toEqual(['Connection established', 'Connection established']);

    expect(clientLogger.errorMessages).toEqual(expect.arrayContaining(['Connection refused. Retry attempt 1...']));
    expect(clientLogger.logMessages).toEqual(['Connection established', 'Connection established']);
  });
});

async function createApp(serverLogger: LoggerService, clientLogger: LoggerService): Promise<INestApplication> {
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

  await app.startAllMicroservices();
  await app.init();

  return app;
}