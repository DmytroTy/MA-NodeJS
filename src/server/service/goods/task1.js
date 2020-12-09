function filterGoods(goods, parameter, value) {
  return goods.filter((good) => (good[parameter] ? good[parameter].toString() : '0') === value);
}

module.exports = filterGoods;
