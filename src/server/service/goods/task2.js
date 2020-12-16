function searchGoodWithMaxCost(goods) {
  let maxCost = 0;
  let goodWithMaxCost;
  goods.forEach((good) => {
    const cost = good.quantity * good.price;
    if (cost > maxCost) {
      maxCost = cost;
      goodWithMaxCost = good;
    }
  });

  return goodWithMaxCost;
}

module.exports = searchGoodWithMaxCost;
