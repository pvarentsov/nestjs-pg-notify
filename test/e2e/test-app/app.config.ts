import { PgNotifyOptions } from '../../../src';

export class AppConfig {
  static readonly validOptions: PgNotifyOptions = {
    connection: {
      host: 'localhost',
      port: 5432,
      database: 'pgnotify',
      user: 'pgnotify',
      password: 'pgnotify',
    },
    strategy: {
      retryInterval: 1_000,
      retryTimeout: Number.POSITIVE_INFINITY
    }
  };

  static readonly invalidOptions: PgNotifyOptions = {
    connection: {
      host: 'localhost',
      port: 5435,
      database: 'pgnotify',
      user: 'pgnotify',
      password: 'pgnotify',
    },
    strategy: {
      retryInterval: 0,
      retryLimit: 2,
    }
  };
}