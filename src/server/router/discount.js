const express = require('express');
const asyncHandler = require('express-async-handler');
const { discountCallback, discountPromise, discountAsyncAwait } = require('../controller/discount');

const discount = express.Router();

discount.get('/callback', (req, res, next) => {
  discountCallback(res, next);
});

discount.get('/promise', (req, res, next) => {
  discountPromise(res, next);
});

discount.get(
  '/async-await',
  asyncHandler(async (req, res, next) => {
    await discountAsyncAwait(res, next);
  }),
);

module.exports = discount;
