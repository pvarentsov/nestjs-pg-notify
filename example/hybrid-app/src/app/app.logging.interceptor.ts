import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Request } from 'express';
import { PgNotifyContext } from 'nestjs-pg-notify';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {

  public intercept(context: ExecutionContext, next: CallHandler): Observable<void> {
    if (context.getType() === 'http') {
      return this.logHttp(context.switchToHttp().getRequest(), next);
    }

    if (context.getType() === 'rpc') {
      const rpcContext = context.switchToRpc().getContext();

      if (rpcContext instanceof PgNotifyContext) {
        return this.logPgNotify(rpcContext, next);
      }
    }

    return next.handle();
  }

  private logHttp(request: Request, next: CallHandler): Observable<void> {
    return next.handle().pipe(
      tap((): void => {
        const message: string =
          '[Http] ' +
          `Method: ${request.method}; ` +
          `Path: ${request.path};`;

        Logger.log(message, LoggingInterceptor.name);
      })
    );
  }

  private logPgNotify(context: PgNotifyContext, next: CallHandler): Observable<void> {
    return next.handle().pipe(
      tap((): void => {
        const channel = context.getChannel();
        const data = context.getData();
        const requestId = context.getRequestId();

        let message: string =
          '[PgNotify] ' +
          `Channel: ${typeof channel === 'string' ? channel : JSON.stringify(channel)}; ` +
          `ProcessId: ${context.getProcessId()}; ` +
          `Data: ${typeof data === 'string' ? data : JSON.stringify(data)};`;

        if (requestId) {
          message += ` RequestId: ${requestId};`;
        }

        Logger.log(message, LoggingInterceptor.name);
      })
    );
  }

}

