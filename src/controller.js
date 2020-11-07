const { task1: filterGoods, task2: goodWithMaxCost, task3 } = require('./task');
const goods = require('../goods');

function good(response, queryParams) {
  const data = filterGoods(goods, queryParams.parameter, queryParams.value);
  response.write(JSON.stringify(data));
  response.end();
}

function findGoodWithMaxCost(response) {
  response.write(JSON.stringify(goodWithMaxCost));
  response.end();
}

function standardize(data, response) {
  const standard = task3(goods);
  response.write(JSON.stringify(standard));
  response.end();
}

module.exports = { good, goodWithMaxCost: findGoodWithMaxCost, standardize };
