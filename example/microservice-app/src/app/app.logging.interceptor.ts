import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { PgNotifyContext } from 'nestjs-pg-notify';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {

  public intercept(context: ExecutionContext, next: CallHandler): Observable<void> {
    const pgNotifyContext = context.switchToRpc().getContext<PgNotifyContext>();

    return next.handle().pipe(
      tap((): void => {
        const channel = pgNotifyContext.getChannel();
        const data = pgNotifyContext.getData();
        const requestId = pgNotifyContext.getRequestId();

        let message: string =
          '[PgNotify] ' +
          `Channel: ${typeof channel === 'string' ? channel : JSON.stringify(channel)}; ` +
          `ProcessId: ${pgNotifyContext.getProcessId()}; ` +
          `Data: ${typeof data === 'string' ? data : JSON.stringify(data)};`;

        if (requestId) {
          message += ` RequestId: ${requestId};`;
        }

        Logger.log(message, LoggingInterceptor.name);
      })
    );
  }

}

