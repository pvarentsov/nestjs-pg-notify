import { Controller, Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { Ctx, Payload } from '@nestjs/microservices';
import { PgNotifyContext, PgNotifyEventPattern, PgNotifyMessagePattern } from 'nestjs-pg-notify';
import { AppUserCreatedDto } from './dto/app.user-created.dto';
import { AppUserRemovedDto } from './dto/app.user-removed.dto';

@Controller()
export class AppController {

  @PgNotifyEventPattern('user:created')
  @UsePipes(new ValidationPipe())
  onUserCreated(
    @Payload() payload: AppUserCreatedDto,
    @Ctx() context: PgNotifyContext,

  ): string
  {
    const serializedPayload = JSON.stringify(payload);
    const serializedContext = JSON.stringify(context);

    Logger.debug(
      `User created! Payload: ${serializedPayload}; Context: ${serializedContext}`,
      AppController.name,
    );

    return 'UserCreated: Ok';
  }

  @PgNotifyMessagePattern({event: 'removed', target: 'user'})
  @UsePipes(new ValidationPipe())
  onUserRemoved(
    @Payload() payload: AppUserRemovedDto,
    @Ctx() context: PgNotifyContext,

  ): string
  {
    const serializedPayload = JSON.stringify(payload);
    const serializedContext = JSON.stringify(context);

    Logger.debug(
      `User removed! Payload: ${serializedPayload}; Context: ${serializedContext}`,
      AppController.name,
    );

    return 'UserRemoved: Ok';
  }

}