const fs = require('fs');
const { incorrectData } = require('../router');
const db = require('../../db');
const { STORE_FILE } = require('../../config');
const { readStorage } = require('../service');
const {
  task1: filterGoods,
  task2: goodsWithMaxCost,
  task3: standardize,
} = require('../service/goods');

async function findGoods(req, res, next) {
  const goods = filterGoods(await readStorage(next), req.query.parameter, req.query.value);
  res.json(goods);
}

async function findGoodsWithMaxCost(res, next) {
  const product = goodsWithMaxCost(await readStorage(next));
  res.json(product);
}

async function standardizeGoods(res, next) {
  const standard = await readStorage(next);
  res.json(standard);
}

function switchStorage(req, res) {
  let message;
  switch (req.query.storage) {
    case 'database':
      global.storageIn = 'database';
      message = 'Storage is switched to Database';
      break;
    case 'json':
      global.storageIn = 'json';
      message = 'Storage is switched to JSON';
      break;
    case 'store':
      global.storageIn = 'store';
      message = 'Storage is switched to a global variable';
      break;
    default:
      incorrectData(res);
      return;
  }
  res.json({ message });
}

async function newData(req, res, next) {
  if (
    !Array.isArray(req.body) ||
    req.body.length < 1 ||
    req.body.some((obj) => !obj.type || !obj.color || (!obj.price && !obj.priceForPair))
  ) {
    incorrectData(res);
    return;
  }

  try {
    const products = [];
    // eslint-disable-next-line default-case
    switch (global.storageIn) {
      case 'database':
        // eslint-disable-next-line no-restricted-syntax
        for (const product of standardize(req.body)) {
          // eslint-disable-next-line no-await-in-loop
          products.push(await db.upsertProduct(product));
        }
        res.json(products);
        return;
      case 'json':
        fs.writeFileSync(STORE_FILE, JSON.stringify(req.body, null, 1));
        break;
      case 'store':
        global.store = req.body;
    }
    res.json(req.body);
  } catch (err) {
    console.error(err.message);
    next(err);
  }
}

module.exports = {
  findGoods,
  findGoodsWithMaxCost,
  standardizeGoods,
  newData,
  switchStorage,
};
