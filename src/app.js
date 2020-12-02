const http = require('http');
require('dotenv').config();
const requestHandler = require('./server/requestHandler');
const { autoOptimizationCsv } = require('./server/service');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || 'localhost';
const INTERVAL_OPTIMIZATION = Number(process.env.INTERVAL_OPTIMIZATION) || 600000;
let intervalID;
const server = http.createServer(requestHandler);

(function boot() {
  server.listen(PORT, HOST, () => {
    console.log(`Server started: ${server.address().address}:${server.address().port}`);
  });

  intervalID = setInterval(autoOptimizationCsv, INTERVAL_OPTIMIZATION);
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
    process.exit();
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
