const { port, host, INTERVAL_OPTIMIZATION } = require('./config');
const db = require('./db');
const app = require('./server');
const { autoOptimizationCsv } = require('./server/service/storesCSV');

let server;
let intervalID;

(async function boot() {
  try {
    await db.init();

    db.setType('knex');

    console.log(`Now DB wrapper type is ${db.getType()}`);

    server = app.listen(port, host, () => {
      console.log(`Server started: ${host}:${port}`);
    });

    intervalID = setInterval(() => autoOptimizationCsv(server), INTERVAL_OPTIMIZATION);
  } catch (err) {
    console.error('ERROR: Booting error', err.message || err);
  }
})();

function exitHandler(error) {
  if (error) console.error(error);

  console.log('Gracefully stopping...');
  clearInterval(intervalID);

  server.close(async (err) => {
    if (err) {
      console.error(err, 'ERROR: Failed to close server!');
    } else {
      console.log('INFO: Server has been stopped.');
    }
    await db.end();
    process.exit(1);
  });
}

// Catches ctrl+c event
process.on('SIGINT', exitHandler);
process.on('SIGTERM', exitHandler);

// Catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler);
process.on('SIGUSR2', exitHandler);

// Catches uncaught/unhandled exceptions
process.on('uncaughtException', exitHandler);
process.on('unhandledRejection', exitHandler);
