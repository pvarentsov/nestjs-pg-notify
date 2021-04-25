import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy, Ctx, Payload } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { PgNotifyContext, PgNotifyEventPattern, PgNotifyMessagePattern, PgNotifyResponse } from '../../../src';
import { AppToken } from './app.token';

@Controller()
export class AppController {

  private readonly onEventPatternCalls: Map<string, {payload: any, context: PgNotifyContext}>;

  constructor(
    @Inject(AppToken.PgNotifyClient)
    private readonly client: ClientProxy,
  ) {
    this.onEventPatternCalls = new Map();
  }

  @PgNotifyEventPattern('event')
  onEventPattern(@Payload() data: any, @Ctx() context: PgNotifyContext): string {
    this.onEventPatternCalls.set(data.eventId, {
      payload: data.payload,
      context: context,
    });

    return 'Event: Ok';
  }

  @PgNotifyMessagePattern({event: 'event'})
  onMessagePattern(@Payload() payload: any, @Ctx() context: PgNotifyContext): Record<string, any> {
    return {
      payload: payload,
      context: context,
      response: 'Request: Ok'
    };
  }

  @Post('send-request')
  sendRequest(@Body() body: any): Observable<PgNotifyResponse> {
    return this.client.send({event: 'event'}, body);
  }

  @Post('emit-event')
  emitEvent(@Body() body: any): Observable<void> {
    return this.client.emit('event', body);
  }

  getOnEventPatternCall(id: string): {payload: any, context: PgNotifyContext}|undefined {
    return this.onEventPatternCalls.get(id);
  }
}