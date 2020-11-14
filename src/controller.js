const fs = require('fs');
const path = require('path');
const { task1: filterGoods, task2: goodWithMaxCost, task3 } = require('./task');

const pathToFile = path.resolve(__dirname, '../', 'goods.json');

let store = [];
let storageInJson = true;

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

function readStorage(response) {
  if (!storageInJson) return store;

  let goods;

  try {
    const rawdata = fs.readFileSync(pathToFile, 'utf8');
    goods = JSON.parse(rawdata);
  } catch (err) {
    console.error(err.message);
    serverError(response);
  }

  return goods;
}

function good(response, queryParams) {
  const goods = filterGoods(readStorage(response), queryParams.parameter, queryParams.value);
  response.write(JSON.stringify(goods));
  response.end();
}

function findGoodWithMaxCost(response) {
  const product = goodWithMaxCost(readStorage(response));
  response.write(JSON.stringify(product));
  response.end();
}

function standardize(response) {
  const standard = task3(readStorage(response));
  response.write(JSON.stringify(standard));
  response.end();
}

function switchStorage(response, queryParams) {
  let message;
  switch (queryParams.storage) {
    case 'json':
      storageInJson = true;
      message = 'Storage is switched to JSON';
      break;
    case 'store':
      storageInJson = false;
      message = 'Storage is switched to a global variable';
      break;
    default:
      return incorrectData(response);
  }
  response.write(JSON.stringify({ message }));
  return response.end();
}

function newData(data, response) {
  if (
    !Array.isArray(data) ||
    data.length < 1 ||
    data.some((obj) => !obj.type || !obj.color || (!obj.price && !obj.priceForPair))
  )
    return incorrectData(response);

  try {
    if (!storageInJson) store = data;
    else fs.writeFileSync(pathToFile, JSON.stringify(data, null, 1));
  } catch (err) {
    console.error(err.message);
    serverError(response);
  }
  response.write(JSON.stringify(data));
  return response.end();
}

module.exports = { good, findGoodWithMaxCost, standardize, newData, switchStorage };
