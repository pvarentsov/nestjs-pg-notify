import { INestApplication } from '@nestjs/common';
import { MicroserviceOptions } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import * as supertest from 'supertest';
import { PgNotifyServer } from '../../src';
import { AppConfig } from './test-app/app.config';
import { AppModule } from './test-app/app.module';

describe('E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test
      .createTestingModule({imports: [AppModule]})
      .compile();

    app = module.createNestApplication();

    app.connectMicroservice<MicroserviceOptions>({
      strategy: new PgNotifyServer(AppConfig.validOptions),
    });

    await app.startAllMicroservicesAsync();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Expect it sends request and receives response', async () => {
    const response = await supertest(app.getHttpServer())
      .post('/send-request')
      .send({message: 'hello'});

    const body = response.body;

    expect(body.status).toEqual(200);

    expect(body.data).toEqual(expect.objectContaining({
      sentPayload: {message: 'hello'},
      response: 'Request: Ok'
    }));

    expect(typeof body.data.context.processId === 'number').toBeTruthy();
    expect(typeof body.data.context.requestId === 'string').toBeTruthy();
    expect(body.data.context.channel).toEqual({event: 'event'});
    expect(body.data.context.data).toEqual({message: 'hello'});
  });
});