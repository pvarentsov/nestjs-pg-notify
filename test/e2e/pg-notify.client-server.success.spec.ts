import { INestApplication } from '@nestjs/common';
import { MicroserviceOptions } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import * as supertest from 'supertest';
import { v4 } from 'uuid';
import { PgNotifyServer } from '../../src';
import { AppConfig } from './test-app/app.config';
import { AppController } from './test-app/app.controller';
import { AppModule } from './test-app/app.module';

describe('E2E: Client-Server -> Success', () => {
  let app: INestApplication;
  let controller: AppController;

  beforeAll(async () => {
    const module: TestingModule = await Test
      .createTestingModule({
        imports: [
          AppModule.configure({client: AppConfig.validOptions})
        ]
      })
      .compile();

    controller = module.get<AppController>(AppController);
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
      payload: {message: 'hello'},
      response: 'Request: Ok'
    }));

    expect(typeof body.data.context.processId === 'number').toBeTruthy();
    expect(typeof body.data.context.requestId === 'string').toBeTruthy();
    expect(body.data.context.channel).toEqual({event: 'event'});
    expect(body.data.context.data).toEqual({message: 'hello'});
  });

  it('Expect it emits event and does not await response', async () => {
    const eventId = v4();
    const payload = 'Hello!';

    const response = await supertest(app.getHttpServer())
      .post('/emit-event')
      .send({eventId, payload});

    const onEventPatternCall = controller.getOnEventPatternCall(eventId);

    expect(onEventPatternCall).toBeDefined();
    expect(response.body).toEqual({});

    expect(onEventPatternCall?.payload).toEqual('Hello!');

    expect(typeof onEventPatternCall?.context.getProcessId() === 'number').toBeTruthy();
    expect(onEventPatternCall?.context.getRequestId()).toBeUndefined();
    expect(onEventPatternCall?.context.getChannel()).toEqual('event');
    expect(onEventPatternCall?.context.getData()).toEqual({eventId, payload});
  });
});