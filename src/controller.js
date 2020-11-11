const fs = require('fs');
const path = require('path');
const { task1: filterGoods, task2: goodWithMaxCost, task3 } = require('./task');

const pathToFile = path.resolve(__dirname, '../', 'goods.json');

function readFile() {
  const rawdata = fs.readFileSync(pathToFile, 'utf8');
  let goods;
  try {
    goods = JSON.parse(rawdata);
  } catch (err) {
    console.error(err.message);
  }

  return goods;
}

function good(response, queryParams) {
  const goods = filterGoods(readFile(), queryParams.parameter, queryParams.value);
  response.write(JSON.stringify(goods));
  response.end();
}

function findGoodWithMaxCost(response) {
  response.write(JSON.stringify(goodWithMaxCost));
  response.end();
}

function standardize(response) {
  const standard = task3(readFile());
  response.write(JSON.stringify(standard));
  response.end();
}

function newData(data, response) {
  fs.writeFileSync(pathToFile, JSON.stringify(data, null, 1));
  response.write(JSON.stringify(data));
  response.end();
}

module.exports = { good, goodWithMaxCost: findGoodWithMaxCost, standardize, newData };
