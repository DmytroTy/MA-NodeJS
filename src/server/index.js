const express = require('express');
const bodyParser = require('body-parser');
const basicAuth = require('express-basic-auth');
const asyncHandler = require('express-async-handler');
const goods = require('./router/goods');
const discount = require('./router/discount');
const storesCSV = require('./router/storesCSV');
const { errorHandler } = require('./router');

const { uploadCsv } = require('./controller/storesCSV');

const app = express();

app.use(
  basicAuth({
    users: { Masters: 'Academy' },
    challenge: true,
    realm: '"Access to the staging site", charset="UTF-8"',
  }),
);

app.post(
  '/stores-csv',
  asyncHandler(async (req, res, next) => {
    if (req.headers['content-type'] === 'application/gzip') {
      try {
        await uploadCsv(req, next);
      } catch (err) {
        console.error('Failed to upload CSV', err);

        return next(new Error('500 Server error'));
      }
      return res.json({ status: '200 OK' });
    }
    return next();
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
