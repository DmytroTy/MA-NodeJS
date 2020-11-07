const { task1: filterGoods, task2: goodWithMaxCost, task3 } = require('./task');
const local = require('../goods');

let store = [];
let goods = local;

function good(response, queryParams) {
  const data = filterGoods(goods, queryParams.parameter, queryParams.value);
  response.write(JSON.stringify(data));
  response.end();
}

function findGoodWithMaxCost(response) {
  response.write(JSON.stringify(goodWithMaxCost));
  response.end();
}

function standardize(response) {
  const standard = task3(goods);
  response.write(JSON.stringify(standard));
  response.end();
}

function newData(data, response) {
  store = data;
  response.write(JSON.stringify(store));
  response.end();
}

function change(response, queryParams) {
  if (queryParams.storage === 'store') goods = store;
  if (queryParams.storage === 'json') goods = local;
  response.write(JSON.stringify(goods));
  response.end();
}

module.exports = { good, goodWithMaxCost: findGoodWithMaxCost, standardize, newData, change };
