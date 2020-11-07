const http = require('http');
require('dotenv').config();

const requestHandler = require('./requestHandler');

const PORT = Number(process.env.PORT) || 3000;
const server = http.createServer(requestHandler);
server.listen(PORT, 'localhost', console.log(`Server starts at port: ${PORT}`));

process.on('uncaughtException', (err) => {
  console.error(err);
});
