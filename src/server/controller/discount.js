/* eslint-disable no-plusplus */
const { task3: standardize } = require('../service/goods');
const { readStorage } = require('../service');
const {
  getDiscountCallback,
  getDiscountPromise,
  getDiscountAsyncAwait,
} = require('../service/discount');

function discountCallback(res) {
  const standard = standardize(readStorage(res));
  let mapped = 0;

  const discountedGoods = standard.myMap((product) => {
    let times = 1;
    if (product.type === 'hat')
      if (product.color === 'red') times = 3;
      else times = 2;

    getDiscountCallback(times, [], (discounts) => {
      const correction = discounts.reduce((before, discount) => before * (1 - discount / 100), 1);
      const discount = Math.trunc((1 - correction) * 100);
      product.discount = `${discount}%`;
      mapped++;
      // eslint-disable-next-line no-use-before-define
      if (mapped === standard.length) sendResponse();
    });

    return product;
  });

  function sendResponse() {
    res.json(discountedGoods);
  }
}

function discountPromise(res) {
  const standard = standardize(readStorage(res));
  let mapped = 0;

  const discountedGoods = standard.myMap((product) => {
    let times = 1;
    if (product.type === 'hat')
      if (product.color === 'red') times = 3;
      else times = 2;

    getDiscountPromise(times, [], (discounts) => {
      const correction = discounts.reduce((before, discount) => before * (1 - discount / 100), 1);
      const discount = Math.trunc((1 - correction) * 100);
      product.discount = `${discount}%`;
      mapped++;
      // eslint-disable-next-line no-use-before-define
      if (mapped === standard.length) sendResponse();
    });

    return product;
  });

  function sendResponse() {
    res.json(discountedGoods);
  }
}

async function discountAsyncAwait(res, next) {
  const standard = standardize(readStorage(res));
  try {
    const discountedGoods = await standard.myMapAsync(async (product) => {
      let discount = getDiscountAsyncAwait();
      const discount2 = getDiscountAsyncAwait();
      const discount3 = getDiscountAsyncAwait();
      let correction;
      if (product.type === 'hat') {
        correction = (1 - (await discount) / 100) * (1 - (await discount2) / 100);
        if (product.color === 'red') correction *= 1 - (await discount3) / 100;
        discount = Math.trunc((1 - correction) * 100);
      }
      product.discount = `${await discount}%`;

      return product;
    });

    res.json(discountedGoods);
  } catch (err) {
    console.error(err.message);
    next(new Error('500 Server error'));
  }
}

module.exports = {
  discountCallback,
  discountPromise,
  discountAsyncAwait,
};
