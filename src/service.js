/* eslint-disable no-plusplus */
const util = require('util');

function myMap(array, callback) {
  const result = [];
  for (let index = 0; index < array.length; index++) {
    result.push(callback(array[index]));
  }
  return result;
}

async function myMapAsync(array, callback) {
  const result = [];
  // eslint-disable-next-line no-restricted-syntax
  for await (const element of array) {
    result.push(await callback(element));
  }
  return result;
}

function generateDiscount(callback) {
  setTimeout(() => {
    const discount = Math.floor(Math.random() * 99 + 1);
    if (discount < 20) callback(null, discount);
    else callback(new Error('The store cannot afford such big discounts.'));
  }, 50);
}

const generateDiscountPromisified = util.promisify(generateDiscount);

function generateDiscountPromise() {
  return new Promise((resolve, reject) =>
    generateDiscount((error, discount) => (error ? reject(error) : resolve(discount))),
  );
}

function getDiscountCallback(callback) {
  generateDiscount((err, discount) => (err ? getDiscountCallback(callback) : callback(discount)));
}

function recursionPromise(times, discounts, callback) {
  generateDiscountPromisified()
    .then((discount) => {
      discounts.push(discount);
      if (discounts.length < times) recursionPromise(times, discounts, callback);
      else callback(discounts);
    })
    .catch(() => recursionPromise(times, discounts, callback));
}

function getDiscountPromise(times, callback) {
  const discounts = [];
  for (let counter = 0; counter < times; counter++) {
    recursionPromise(times, discounts, callback);
  }
}

async function getDiscountAsyncAwait() {
  try {
    return await generateDiscountPromise();
  } catch (err) {
    return getDiscountAsyncAwait();
  }
}

module.exports = {
  myMap,
  myMapAsync,
  getDiscountCallback,
  getDiscountPromise,
  getDiscountAsyncAwait,
};
