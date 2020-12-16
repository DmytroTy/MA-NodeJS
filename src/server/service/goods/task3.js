function standardize(goods) {
  return goods.map((good) => {
    return {
      type: good.type,
      color: good.color,
      quantity: good.quantity || 0,
      price: +(good.price || good.priceForPair).slice(1),
    };
  });
}

module.exports = standardize;
