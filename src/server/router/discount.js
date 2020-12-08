const express = require('express');
const asyncHandler = require('express-async-handler');
const { discountCallback, discountPromise, discountAsyncAwait } = require('../controller/discount');

const discount = express.Router();

discount.get('/callback', (req, res) => {
  discountCallback(res);
});

discount.get('/promise', (req, res) => {
  discountPromise(res);
});

discount.get(
  '/async-await',
  asyncHandler(async (req, res, next) => {
    await discountAsyncAwait(res, next);
  }),
);

module.exports = discount;
