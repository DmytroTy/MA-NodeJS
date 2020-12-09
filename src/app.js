const { port, host, INTERVAL_OPTIMIZATION } = require('./config');
const app = require('./server');
const { autoOptimizationCsv } = require('./server/service/storesCSV');

let server;
let intervalID;

(function boot() {
  server = app.listen(port, host, () => {
    console.log(`Server started: ${host}:${port}`);
  });

  intervalID = setInterval(() => autoOptimizationCsv(server), INTERVAL_OPTIMIZATION);
})();

function exitHandler(error) {
  if (error) console.error(error);

  console.log('Gracefully stopping...');
  clearInterval(intervalID);

  server.close((err) => {
    if (err) {
      console.error(err, 'Failed to close server!');
      process.exit();
    }
    console.log('Server has been stopped.');
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
