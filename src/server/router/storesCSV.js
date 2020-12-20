const express = require('express');
const asyncHandler = require('express-async-handler');
const { uploadCsv, getStores, optimizeCsv } = require('../controller/storesCSV');

const storesCSV = express.Router();

storesCSV.get(
  '/',
  asyncHandler(async (req, res, next) => {
    await getStores(res, next);
  }),
);

storesCSV.post(
  '/',
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

storesCSV.put('/optimize/:fileName', (req, res) => {
  const { fileName } = req.params;
  optimizeCsv(fileName, res);
});

module.exports = storesCSV;
