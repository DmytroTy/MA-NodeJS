const fs = require('fs');
const { STORE_FILE } = require('../../config');
const { readStorage } = require('../service');
const {
  task1: filterGoods,
  task2: goodsWithMaxCost,
  task3: standardize,
} = require('../service/goods');

function incorrectData(res) {
  res.status(406).json({ error: '406', message: '406 Incorrect data recived!' });
}

function findGoods(req, res, next) {
  const goods = filterGoods(readStorage(next), req.query.parameter, req.query.value);
  res.json(goods);
}

function findGoodsWithMaxCost(res, next) {
  const product = goodsWithMaxCost(readStorage(next));
  res.json(product);
}

function standardizeGoods(res, next) {
  const standard = standardize(readStorage(next));
  res.json(standard);
}

function switchStorage(req, res) {
  let message;
  switch (req.query.storage) {
    case 'json':
      global.storageInJson = true;
      message = 'Storage is switched to JSON';
      break;
    case 'store':
      global.storageInJson = false;
      message = 'Storage is switched to a global variable';
      break;
    default:
      return incorrectData(res);
  }
  return res.json({ message });
}

function newData(req, res, next) {
  if (
    !Array.isArray(req.body) ||
    req.body.length < 1 ||
    req.body.some((obj) => !obj.type || !obj.color || (!obj.price && !obj.priceForPair))
  )
    return incorrectData(res);

  try {
    if (!global.storageInJson) global.store = req.body;
    else fs.writeFileSync(STORE_FILE, JSON.stringify(req.body, null, 1));
  } catch (err) {
    console.error(err.message);
    return next(new Error('500 Server error'));
  }
  return res.json(req.body);
}

module.exports = {
  findGoods,
  findGoodsWithMaxCost,
  standardizeGoods,
  newData,
  switchStorage,
};
