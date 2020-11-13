const fs = require('fs');
const path = require('path');
const { task1: filterGoods, task2: goodWithMaxCost, task3 } = require('./task');

const pathToFile = path.resolve(__dirname, '../', 'goods.json');

function incorrectData(response) {
  response.statusCode = 406;
  response.write(JSON.stringify({ error: '406', message: '406 Incorrect data recived' }));
  response.end();
}

function serverError(response) {
  response.statusCode = 500;
  response.write(JSON.stringify({ error: '500', message: '500 Server error' }));
  response.end();
}

function readFileStorage(response) {
  let rawdata;
  let goods;
  try {
    rawdata = fs.readFileSync(pathToFile, 'utf8');
    goods = JSON.parse(rawdata);
  } catch (err) {
    console.error(err.message);
    serverError(response);
  }

  return goods;
}

function good(response, queryParams) {
  const goods = filterGoods(readFileStorage(response), queryParams.parameter, queryParams.value);
  response.write(JSON.stringify(goods));
  response.end();
}

function findGoodWithMaxCost(response) {
  const product = goodWithMaxCost(readFileStorage(response));
  response.write(JSON.stringify(product));
  response.end();
}

function standardize(response) {
  const standard = task3(readFileStorage(response));
  response.write(JSON.stringify(standard));
  response.end();
}

function newData(data, response) {
  if (
    !Array.isArray(data) ||
    data.length < 1 ||
    data.some((obj) => !obj.type || !obj.color || (!obj.price && !obj.priceForPair))
  )
    return incorrectData(response);
  try {
    fs.writeFileSync(pathToFile, JSON.stringify(data, null, 1));
  } catch (err) {
    console.error(err.message);
    serverError(response);
  }
  response.write(JSON.stringify(data));
  return response.end();
}

module.exports = { good, goodWithMaxCost: findGoodWithMaxCost, standardize, newData };
