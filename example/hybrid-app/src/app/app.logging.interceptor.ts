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
    const requestStartDate: number = Date.now();

    return next.handle().pipe(
      tap((): void => {
        const requestFinishDate: number = Date.now();

        const message: string =
          '[Http] ' +
          `Method: ${request.method}; ` +
          `Path: ${request.path}; ` +
          `SpentTime: ${requestFinishDate - requestStartDate}ms`;

        Logger.log(message, LoggingInterceptor.name);
      })
    );
  }

  private logPgNotify(context: PgNotifyContext, next: CallHandler): Observable<void> {
    const requestStartDate: number = Date.now();

    return next.handle().pipe(
      tap((): void => {
        const requestFinishDate: number = Date.now();

        const channel = context.getChannel();
        const data = context.getData();

        const message: string =
          '[PgNotify] ' +
          `RequestId: ${context.getRequestId()}; ` +
          `Channel: ${typeof channel === 'string' ? channel : JSON.stringify(channel)}; ` +
          `ProcessId: ${context.getProcessId()}; ` +
          `Data: ${typeof data === 'string' ? data : JSON.stringify(data)}; ` +
          `SpentTime: ${requestFinishDate - requestStartDate}ms`;

        Logger.log(message, LoggingInterceptor.name);
      })
    );
  }

}

