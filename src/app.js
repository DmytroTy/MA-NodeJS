const { task1: filterGoods, task2: goodWithMaxCost, task3 } = require('./task');
const goods = require('../goods');

function boot(merchandise, parameter, value) {
  const good = filterGoods(merchandise, parameter, value);
  console.log(good);
  console.log(task3(good));
  console.log(goodWithMaxCost);
}

boot(goods, 'type', 'socks');
