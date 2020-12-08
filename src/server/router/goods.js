const express = require('express');
const {
  findGoods,
  findGoodsWithMaxCost,
  standardizeGoods,
  newData,
  switchStorage,
} = require('../controller/goods');

const goods = express.Router();

goods.get('/', (req, res, next) => {
  if (!req.query.parameter || !req.query.value) {
    return res.status(406).json({ error: '406', message: '406 Incorrect parameters' });
  }
  return findGoods(req, res, next);
});

goods.get('/with-max-cost', (req, res, next) => {
  findGoodsWithMaxCost(res, next);
});

goods.get('/standardize', (req, res, next) => {
  standardizeGoods(res, next);
});

goods.get('/switch', (req, res) => {
  switchStorage(req, res);
});

goods.post('/new-data', (req, res, next) => {
  newData(req, res, next);
});

module.exports = goods;
