import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy, Ctx, Payload } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { PgNotifyContext, PgNotifyEventPattern, PgNotifyMessagePattern, PgNotifyResponse } from '../../../src';
import { AppToken } from './app.token';

@Controller()
export class AppController {

  constructor(
    @Inject(AppToken.PgNotifyClient)
    private readonly client: ClientProxy,
  ) {}

  @PgNotifyEventPattern('event')
  onEventPattern(): string {
    return 'Event: Ok';
  }

  @PgNotifyMessagePattern({event: 'event'})
  onMessagePattern(@Payload() payload: any, @Ctx() context: PgNotifyContext): Record<string, any> {
    return {
      sentPayload: payload,
      context: context,
      response: 'Request: Ok'
    };
  }

  @Post('send-request')
  sendRequest(@Body() body: any): Observable<PgNotifyResponse> {
    return this.client.send({event: 'event'}, body);
  }

  @Post('user')
  emitEvent(): Observable<void> {
    return this.client.emit('event', 'hello');
  }

}