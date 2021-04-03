import { AppServer } from './example/app.server';

(async () => {
  const server = new AppServer('0.0.0.0', 3000);
  await server.run();
})()