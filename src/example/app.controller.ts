import { Controller, Logger } from '@nestjs/common';
import { Ctx, Payload } from '@nestjs/microservices';
import { PgNotifyContext } from '../pg-notify/pg-notify.context';
import { PgNotifyEventPattern, PgNotifyMessagePattern } from '../pg-notify/pg-notify.decorator';

@Controller()
export class AppController {

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