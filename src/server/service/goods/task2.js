function searchGoodWithMaxCost(goods) {
  let maxCost = 0;
  let goodWithMaxCost;
  goods.forEach((good) => {
    const price = +(good.price || good.priceForPair).slice(1);
    const cost = (good.quantity || 0) * price;
    if (cost > maxCost) {
      maxCost = cost;
      goodWithMaxCost = good;
    }
  });

  return goodWithMaxCost;
}

module.exports = searchGoodWithMaxCost;
