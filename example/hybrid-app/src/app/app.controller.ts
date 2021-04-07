import { Controller, Delete, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { AppToken } from './app.token';

@Controller()
export class AppController {

  constructor(
    @Inject(AppToken.PgNotifyClient)
    private readonly client: ClientProxy,
  ) {}

  @Post('user')
  createUser(): Observable<string> {
    return this.client.send('user:created', {
      userId: 1,
      date: new Date(),
    }).pipe(
      timeout(2000),
    );
  }

  @Delete('user')
  removeUser(): Observable<string> {
    return this.client.send({target: 'user', event: 'removed'}, {
      userId: 2,
      date: new Date(),
    }).pipe(
      timeout(2000),
    );
  }

}