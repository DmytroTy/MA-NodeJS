const http = require('http');
require('dotenv').config();
const requestHandler = require('./requestHandler');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || 'localhost';
const server = http.createServer(requestHandler);
server.listen(PORT, HOST, () => {
  // ? (${process.env.NODE_ENV})
  console.log(`Server started: ${server.address().address}:${server.address().port}`);
});

function exitHandler(error) {
  if (error) console.error(error);

  console.log('Gracefully stopping...');
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
