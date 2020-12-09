const express = require('express');
const asyncHandler = require('express-async-handler');
const { getStores, optimizeCsv } = require('../controller/storesCSV');

const storesCSV = express.Router();

storesCSV.get(
  '/',
  asyncHandler(async (req, res, next) => {
    await getStores(res, next);
  }),
);

storesCSV.put('/optimize/:fileName', (req, res) => {
  const { fileName } = req.params;
  optimizeCsv(fileName, res);
});

module.exports = storesCSV;
