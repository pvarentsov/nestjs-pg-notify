import { AppServer } from './example/app.server';

(async (): Promise<void> => {
  const server = new AppServer('0.0.0.0', 3005);
  await server.run();
})();