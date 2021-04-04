import { Controller, Get, Inject, Logger } from '@nestjs/common';
import { ClientProxy, Ctx, Payload } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PgNotifyContext } from '../pg-notify/pg-notify.context';
import { PgNotifyEventPattern, PgNotifyMessagePattern } from '../pg-notify/pg-notify.decorator';

@Controller()
export class AppController {

  constructor(
    @Inject('PG_NOTIFY_CLIENT')
    private readonly client: ClientProxy,
  ) {}

  @Get('event')
  public sendEvent(): Observable<void> {
    return this.client.emit('greet', {message: 'hello'}).pipe(
      tap(res => Logger.debug(res, AppController.name))
    );
  }

  @Get('request')
  public sendRequest(): Observable<void> {
    return this.client.send({event: 'greet', a: 'test'}, {message: 'hello'}).pipe(
      tap(res => Logger.debug(res, AppController.name))
    );
  }

  @PgNotifyEventPattern('greet')
  public onEventPattern(@Payload() payload: any, @Ctx() ctx: PgNotifyContext): string {
    Logger.debug(`Payload: ${JSON.stringify(payload)}`, AppController.name);
    Logger.debug(`Context: ${JSON.stringify(ctx)}`, AppController.name);

    return 'Hello!';
  }

  @PgNotifyMessagePattern({event: 'greet', a: 'test'})
  public onMessagePattern(@Payload() payload: any, @Ctx() ctx: PgNotifyContext): string {
    Logger.debug(`Payload: ${JSON.stringify(payload)}`, AppController.name);
    Logger.debug(`Context: ${JSON.stringify(ctx)}`, AppController.name);

    return 'Hello!';
  }

}