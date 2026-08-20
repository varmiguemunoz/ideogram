import { Container } from './container';
import { createApp } from './server';

const container = new Container();
const app = createApp(container);

const server = app.listen(container.config.port, '127.0.0.1', () => {
  console.log(`congen api listening on http://127.0.0.1:${container.config.port}`);
  container.resume();
});

function shutdown(): void {
  server.close(() => {
    container.shutdown();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
