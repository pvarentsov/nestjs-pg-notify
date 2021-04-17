import { Controller, Delete, Inject, Post, UseFilters, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { ClientProxy, Ctx, Payload } from '@nestjs/microservices';
import { PgNotifyContext, PgNotifyEventPattern, PgNotifyMessagePattern, PgNotifyResponse } from 'nestjs-pg-notify';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { ExceptionFilter } from './app.exception.filter';
import { LoggingInterceptor } from './app.logging.interceptor';
import { AppToken } from './app.token';
import { AppUserCreatedDto } from './dto/app.user-created.dto';
import { AppUserRemovedDto } from './dto/app.user-removed.dto';

@Controller()
@UseFilters(ExceptionFilter)
@UseInterceptors(LoggingInterceptor)
export class AppController {

  constructor(
    @Inject(AppToken.PgNotifyClient)
    private readonly client: ClientProxy,
  ) {}

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

  @Post('user')
  createUser(): Observable<PgNotifyResponse> {
    return this.client.send<PgNotifyResponse>('user:created', {
      userId: 1,
      date: new Date(),
    }).pipe(
      timeout(2000),
    );
  }

  @Delete('user')
  removeUser(): Observable<string> {
    return this.client.emit({target: 'user', event: 'removed'}, {
      userId: 2,
      date: new Date(),
    });
  }

}