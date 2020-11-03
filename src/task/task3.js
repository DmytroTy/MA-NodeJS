function standardize(goods) {
  const standard = [];
  goods.forEach((good) => {
    standard.push({
      type: good.type,
      color: good.color,
      quantity: good.quantity || 0,
      price: good.price || good.priceForPair,
    });
  });

  return standard;
}

module.exports = standardize;
