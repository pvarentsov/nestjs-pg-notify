import { Controller, UseFilters, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { Ctx, Payload } from '@nestjs/microservices';
import { PgNotifyContext, PgNotifyEventPattern, PgNotifyMessagePattern } from 'nestjs-pg-notify';
import { ExceptionFilter } from './app.exception.filter';
import { LoggingInterceptor } from './app.logging.interceptor';
import { AppUserCreatedDto } from './dto/app.user-created.dto';
import { AppUserRemovedDto } from './dto/app.user-removed.dto';

@Controller()
@UseFilters(ExceptionFilter)
@UseInterceptors(LoggingInterceptor)
export class AppController {

  @PgNotifyEventPattern('user:created')
  @UsePipes(new ValidationPipe())
  onUserCreated(
    @Payload() payload: AppUserCreatedDto,
    @Ctx() context: PgNotifyContext,

  ): string
  {
    return 'UserCreated: Ok';
  }

  @PgNotifyMessagePattern({event: 'removed', target: 'user'})
  @UsePipes(new ValidationPipe())
  onUserRemoved(
    @Payload() payload: AppUserRemovedDto,
    @Ctx() context: PgNotifyContext,

  ): string
  {
    return 'UserRemoved: Ok';
  }

}