const express = require('express');
const bodyParser = require('body-parser');
const basicAuth = require('express-basic-auth');
const goods = require('./router/goods');
const discount = require('./router/discount');
const storesCSV = require('./router/storesCSV');
const { errorHandler } = require('./router');

const app = express();

app.use(
  basicAuth({
    users: { Masters: 'Academy' },
    challenge: true,
    realm: '"Access to the staging site", charset="UTF-8"',
  }),
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/goods', goods);
app.use('/discount', discount);
app.use('/stores-csv', storesCSV);

app.get('/ping', (req, res) => {
  res.send('pong');
});

app.use(errorHandler);

module.exports = app;
