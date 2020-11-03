function filterGoods(goods, parameter, value) {
  return goods.filter((good) => good[parameter] === value);
}

module.exports = filterGoods;
