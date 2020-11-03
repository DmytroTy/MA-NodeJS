const goods = require('../../goods');

function goodWithMaxCost(merchandise) {
  function calculateCost(good) {
    const price = +(good.price || good.priceForPair).slice(1);
    return (good.quantity || 0) * price;
  }

  merchandise.sort((a, b) => calculateCost(b) - calculateCost(a));

  return merchandise[0];
}

module.exports = goodWithMaxCost(goods);
