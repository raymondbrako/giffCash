import http from 'node:http';
import { createApp } from './src/app.js';
import { loadConfig } from './src/config.js';
import { JsonDatabase } from './src/database.js';

const config = loadConfig();
const db = new JsonDatabase(config.dataFile, config);
await db.init();

const server = http.createServer(createApp({ db, config }));
server.listen(config.port, config.host, () => {
  console.log(`GiffCash is running at http://localhost:${config.port}`);
});

function shutdown(signal) {
  console.log(`\nReceived ${signal}. Closing server.`);
  server.close((error) => {
    if (error) {
      console.error(error);
      process.exitCode = 1;
    }
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
