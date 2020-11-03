const { task1: filterGoods, task2: goodWithMaxCost, task3 } = require('./task');

function boot(goods, parameter, value) {
  const good = filterGoods(goods, parameter, value);
  console.log(good);
  console.log(task3(good));
  console.log(goodWithMaxCost);
}

const goods = require('../goods');

boot(goods, 'type', 'socks');
