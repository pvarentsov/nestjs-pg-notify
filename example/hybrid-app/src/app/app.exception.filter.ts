import { ArgumentsHost, Catch, Logger } from '@nestjs/common';
import { PgNotifyContext, PgNotifyResponse } from 'nestjs-pg-notify';
import { Observable, of } from 'rxjs';
import { Response } from 'express';
import { mapTo } from 'rxjs/operators';

@Catch()
export class ExceptionFilter implements ExceptionFilter {

  catch(error: Error & {response?: any}, host: ArgumentsHost): Observable<any> {
    const hostType = host.getType();

    if (hostType === 'http') {
      return this.handleHttp(error, host);
    }

    if (hostType === 'rpc') {
      const context = host.switchToRpc().getContext();

      if (context instanceof PgNotifyContext) {
        return this.handlePgNotify(error, context);
      }
    }

    return of(undefined);
  }

  private handleHttp(error: Error & {response?: any}, host: ArgumentsHost): Observable<void> {
    const response = host
      .switchToHttp()
      .getResponse<Response>();

    const parsedError = this.parseError(error);
    const status = parsedError.status;
    const message = parsedError.message;

    Logger.error(parsedError.message, error.stack, 'HttpExceptionFilter');

    return of(response.json({status, message})).pipe(
      mapTo(undefined),
    );
  }

  private handlePgNotify(error: Error & {response?: any}, context: PgNotifyContext): Observable<PgNotifyResponse|undefined> {
    const parsedError = this.parseError(error);
    const requestId = context.getRequestId();

    Logger.error(parsedError.message, error.stack, 'PgNotifyExceptionFilter');

    if (requestId) {
      return of(PgNotifyResponse.error(parsedError.message, parsedError.status));
    }

    return of(undefined);
  }

  private parseError(error: Error & {response?: any}): {status: number, message: unknown} {
    let status = 500;
    let message = error.message;

    if (error.response) {
      status = error.response.statusCode || status;
      message = error.response.message || message;
    }

    return {status, message};
  }

}