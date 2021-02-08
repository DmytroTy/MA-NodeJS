const express = require('express');
const bodyParser = require('body-parser');
const asyncHandler = require('express-async-handler');
const auth = require('./router/auth');
const cart = require('./router/cart');
const goods = require('./router/goods');
const discount = require('./router/discount');
const storesCSV = require('./router/storesCSV');
const { authenticateToken, errorHandler } = require('./middlewares');
const { getCities } = require('../lib/apiNovaPoshta');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/auth', auth);

app.use(authenticateToken);

app.use('/cart', cart);
app.use('/goods', goods);
app.use('/discount', discount);
app.use('/stores-csv', storesCSV);

app.get('/ping', (req, res) => {
  res.send('pong');
});

app.get(
  '/get-nova-poshta-cities',
  asyncHandler(async (req, res) => {
    const {
      data: { data: cities },
    } = await getCities();
    res.json(cities);
  }),
);

app.use(errorHandler);

module.exports = app;
