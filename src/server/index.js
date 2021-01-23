const express = require('express');
const bodyParser = require('body-parser');
const auth = require('./router/auth');
const goods = require('./router/goods');
const discount = require('./router/discount');
const storesCSV = require('./router/storesCSV');
const { authenticateToken, errorHandler } = require('./middlewares');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/auth', auth);

app.use(authenticateToken);

app.use('/goods', goods);
app.use('/discount', discount);
app.use('/stores-csv', storesCSV);

app.get('/ping', (req, res) => {
  res.send('pong');
});

app.use(errorHandler);

module.exports = app;
