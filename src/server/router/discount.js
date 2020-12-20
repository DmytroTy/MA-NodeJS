const express = require('express');
const asyncHandler = require('express-async-handler');
const { discountCallback, discountPromise, discountAsyncAwait } = require('../controller/discount');

const discount = express.Router();

discount.get(
  '/callback',
  asyncHandler(async (req, res, next) => {
    await discountCallback(res, next);
  }),
);

discount.get(
  '/promise',
  asyncHandler(async (req, res, next) => {
    await discountPromise(res, next);
  }),
);

discount.get(
  '/async-await',
  asyncHandler(async (req, res, next) => {
    await discountAsyncAwait(res, next);
  }),
);

module.exports = discount;
