function goodWithMaxCost(goods) {
  function calculateCost(good) {
    const price = (good.price || good.priceForPair).slice(1);
    return (good.quantity || 0) * price;
  }

  goods.sort((a, b) => calculateCost(b) - calculateCost(a));

  return goods[0];
}

const goods = require('../../goods');

module.exports = goodWithMaxCost(goods);
