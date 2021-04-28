import { INestApplication, LoggerService } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as supertest from 'supertest';
import { AppConfig } from './test-app/app.config';
import { AppLogger } from './test-app/app.logger';
import { AppModule } from './test-app/app.module';
import { AppUtil } from './test-app/app.util';

describe('E2E: Client Reconnection (Success)', () => {

  afterAll(async () => AppUtil.dockerComposeStart());

  it('Expect it reconnects the client', async () => {
    await AppUtil.dockerComposeStop();
    await AppUtil.delay(100);

    const clientLogger = new AppLogger();
    const app = await createApp(clientLogger);

    await AppUtil.dockerComposeStart();
    await AppUtil.delay(1000);

    const response = await supertest(app.getHttpServer())
      .post('/emit-event')
      .send({});

    await app.close();

    expect(response.body).toEqual({});
    expect(clientLogger.errorMessages).toEqual(expect.arrayContaining(['Connection refused. Retry attempt 1...']));
    expect(clientLogger.logMessages).toEqual(expect.arrayContaining(['Connection established']));
  });
});

async function createApp(clientLogger: LoggerService): Promise<INestApplication> {
  const module: TestingModule = await Test
    .createTestingModule({
      imports: [
        AppModule.configure({client: {...AppConfig.validOptions, logger: clientLogger}})
      ]
    })
    .compile();

  const app = module.createNestApplication();
  await app.init();

  return app;
}