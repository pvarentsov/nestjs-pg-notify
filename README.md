# NestJS PG Notify

NestJS custom transport strategy for PostgreSQL Pub/Sub.

[![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](./LICENSE)
![](https://img.shields.io/npm/v/nestjs-pg-notify.svg)

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=pvarentsov_nestjs-pg-notify&metric=alert_status)](https://sonarcloud.io/dashboard?id=pvarentsov_nestjs-pg-notify)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=pvarentsov_nestjs-pg-notify&metric=coverage)](https://sonarcloud.io/dashboard?id=pvarentsov_nestjs-pg-notify)

## PostgreSQL async notifications

PostgreSQL can be used as a Pub/Sub message broker.
Its functionality is similar to the Redis Pub/Sub, but has its own features and limitations.

The [References](#References) section contains links that you may find useful to familiarize yourself with the PostgreSQL asynchronous notifications.

## Custom transporter

`NestJS PG Notify` implements Pub/Sub messaging paradigm using PostgreSQL as a [NestJS custom transporter](https://docs.nestjs.com/microservices/custom-transport). 
It wraps the [pg-listen](https://github.com/andywer/pg-listen) library under the hood.

It can be used in [microservice](https://docs.nestjs.com/microservices/basics) and [hybrid](https://docs.nestjs.com/faq/hybrid-application) 
NestJS applications. The [example](./example) folder contains examples for both types of applications.

## Installation

```bash
$ npm i nestjs-pg-notify
```

## Usage

### Setup `PgNotifyServer` as custom strategy

```typescript
import { PgNotifyServer } from 'nestjs-pg-notify';

const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  strategy: new PgNotifyServer({
    /**
     * - Required parameter
     * - Corresponds to the "pg" library's connection config
     */  
    connection: {
      host: 'localhost',
      port: 5432,
      database: 'pgnotify',
      user: 'pgnotify',
      password: 'pgnotify',
    },
    /**
     * - Optional parameter
     * - Contains retry-strategy config passing the data to the "pg-listen" library
     */
    strategy: {
      retryInterval: 1_000,
      retryTimeout: Number.POSITIVE_INFINITY,
    },
    /**
     * - Optional parameter
     * - Overrides default logger
     */
    logger: new Logger(),
  })
});
```

### Bind message handlers

`NestJS PG Notify` offers two decorators to register message handlers: `@PgNotifyEventPattern()` and `@PgNotifyMessagePattern()`.
These are an alternative to standard decorators: `@EventPattern()` and `@MessagePattern()`.

Message handler's binding can be used only within controller classes.

```typescript
import { PgNotifyContext, PgNotifyEventPattern, PgNotifyMessagePattern } from 'nestjs-pg-notify';

@Controller()
export class AppController {

  @PgNotifyEventPattern({event: 'greeting'})
  @UsePipes(new ValidationPipe())
  onGreetingEvent(@Payload() payload: any, @Ctx() context: PgNotifyContext): void {
    Logger.log(payload.message);
  }

  @PgNotifyMessagePattern('greeting')
  @UsePipes(new ValidationPipe())
  onGreetingRequest(@Payload() payload: any, @Ctx() context: PgNotifyContext): string {
     Logger.log(payload.message);
    return 'Hello!';
  }

}
```

The standard decorator `@Ctx()` allows access to the context of the incoming request. In our case, the context object is an instance of `PgNotifyContext`. 

### Setup `PgNotifyClient` as client proxy

The client proxy can be registered as a custom provider. The configuration is the same as the configuration of the `PgNotifyServer`.

```typescript
import { PgNotifyClient } from 'nestjs-pg-notify';

@Module({
  providers: [
    {
      provide: 'PG_NOTIFY_CLIENT',
      useFactory: (): ClientProxy => new PgNotifyClient({
        connection: {
          host: 'localhost',
          port: 5432,
          database: 'pgnotify',
          user: 'pgnotify',
          password: 'pgnotify',
        },
        strategy: {
          retryInterval: 1_000,
          retryTimeout: Number.POSITIVE_INFINITY,
        }, 
      })
    },
  ],
  exports: [
    'PG_NOTIFY_CLIENT',
  ]
})
export class AppModule {}
```

Then we can inject the client proxy.

```typescript
import { PgNotifyResponse } from 'nestjs-pg-notify';

export class AppService {
  constructor(
    @Inject('PG_NOTIFY_CLIENT')
    private readonly client: ClientProxy,
  ) {}
   
  sendRequest(): Observable<PgNotifyResponse> {
    // Send request and expect response
    return this.client.send('greeting', {message: 'Hello!'}).pipe(
      timeout(2_000),
      tap(response => Logger.debug(response)),
    );
  }
  
  emitEvent(): Observable<void> {
    // Emit event
    return this.client.emit({event: 'greeting'}, {message: 'Hello!'});
  }
}
```

### Exception filters

The client proxy generates request identifier when we send requests using `client.send()`.
The request identifier in the context of the incoming request means that we need to prepare an error response for the client. 

We can use the `PgNotifyResponse.error()` factory in order to unify the structure of the response.

```typescript
import { PgNotifyContext, PgNotifyResponse } from 'nestjs-pg-notify';

@Catch()
export class ExceptionFilter implements ExceptionFilter {
  catch(error: Error, host: ArgumentsHost): Observable<PgNotifyResponse|void> {
    const {status, message} = parseError(error);
    const context = host.switchToRpc().getContext<PgNotifyContext>();
    const requestId = context.getRequestId();

    Logger.error(message, error.stack, 'PgNotifyExceptionFilter');

    if (requestId) {
      return of(PgNotifyResponse.error(message, status));
    }

    return of(undefined);
  }
}
```

Then we can register the filter using the standard `@UseFilters()` decorator. It supports method-scope and controller-scope modes.

```typescript
@Controller()
@UseFilters(ExceptionFilter)
export class AppController {
  // ...
}
```

### Interceptors

```typescript
import { PgNotifyContext } from 'nestjs-pg-notify';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  public intercept(context: ExecutionContext, next: CallHandler): Observable<void> {
    const pgNotifyContext = context
      .switchToRpc()
      .getContext<PgNotifyContext>();

    return next.handle().pipe(
      tap(() => Logger.log(JSON.stringify(pgNotifyContext), LoggingInterceptor.name)),
    );
  }
}
```

To register interceptor we can use `@UseInterceptors()` decorator. It also supports method-scope and controller-scope modes.

```typescript
@Controller()
@UseInterceptors(LoggingInterceptor)
export class AppController {
  // ...
}
```

## API

API documentation is available [here](https://pvarentsov.github.io/nestjs-pg-notify).

## Roadmap

**Version 1.0.0**
- [x] Detailed README
- [x] Usage examples
- [ ] Tests & coverage
- [ ] GitHub actions

## References

1. PostgreSQL Documentation:
   * [Asynchronous Notification](https://www.postgresql.org/docs/9.6/libpq-notify.html)
   * [NOTIFY](https://www.postgresql.org/docs/9.6/sql-notify.html)
   * [LISTEN](https://www.postgresql.org/docs/9.6/sql-listen.html) 
2. PgBouncer Documentation:
   * [Transaction pool mode does not support NOTIFY/LISTEN features](https://www.pgbouncer.org/features.html)
3. NestJS Documentation:
   * [Microservices](https://docs.nestjs.com/microservices/basics)
   * [Hybrid applications](https://docs.nestjs.com/faq/hybrid-application)
   * [Custom transporters](https://docs.nestjs.com/microservices/custom-transport)
4. Dependencies:
   * [pg-listen](https://github.com/andywer/pg-listen)