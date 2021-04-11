import { ArgumentsHost, Catch, Logger } from '@nestjs/common';
import { PgNotifyContext } from 'nestjs-pg-notify';
import { Observable, of } from 'rxjs';

@Catch()
export class ExceptionFilter implements ExceptionFilter {

  catch(error: Error & {response?: any}, host: ArgumentsHost): Observable<any> {
    const context = host.switchToRpc().getContext<PgNotifyContext>();

    let status = 500;
    let err = error.message;

    if (error.response) {
      status = error.response.statusCode || status;
      err = error.response.message || err;
    }

    Logger.error(error.message, error.stack, 'PgNotifyExceptionFilter');

    return of({status, err});
  }
}