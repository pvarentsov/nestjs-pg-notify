import { ArgumentsHost, Catch, Logger } from '@nestjs/common';
import { PgNotifyContext, PgNotifyResponse } from 'nestjs-pg-notify';
import { Observable, of } from 'rxjs';

@Catch()
export class ExceptionFilter implements ExceptionFilter {

  catch(error: Error & {response?: any}, host: ArgumentsHost): Observable<any> {
    const hostType = host.getType();
    const parsedError = this.parseError(error);

    if (hostType === 'rpc') {
      const context = host.switchToRpc().getContext();

      if (context instanceof PgNotifyContext) {
        Logger.error(parsedError.message, error.stack, 'PgNotifyExceptionFilter');
        return of(PgNotifyResponse.error(parsedError.message, parsedError.status));
      }
    }

    return of();
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