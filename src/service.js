/* eslint-disable no-extend-native */
/* eslint-disable no-plusplus */
const { promisify } = require('util');
const { Transform } = require('stream');

function myMap(callback) {
  const result = [];
  for (let index = 0; index < this.length; index++) {
    result.push(callback(this[index]));
  }
  return result;
}

Array.prototype.myMap = myMap;

async function myMapAsync(callback) {
  const result = [];
  try {
    // eslint-disable-next-line no-restricted-syntax
    for await (const element of this) {
      result.push(await callback(element));
    }
  } catch (err) {
    console.error(err);
  }
  return result;
}

Array.prototype.myMapAsync = myMapAsync;

function generateDiscount(callback) {
  setTimeout(() => {
    const discount = Math.floor(Math.random() * 99 + 1);
    if (discount < 20) callback(null, discount);
    else callback(new Error('The store cannot afford such big discounts.'));
  }, 50);
}

const generateDiscountPromisified = promisify(generateDiscount);

function generateDiscountPromise() {
  return new Promise((resolve, reject) => {
    generateDiscount((error, discount) => (error ? reject(error) : resolve(discount)));
  });
}

function getDiscountCallback(times, discounts, callback) {
  generateDiscount((err, discount) => {
    if (err) return getDiscountCallback(times, discounts, callback);

    discounts.push(discount);
    if (discounts.length < times) getDiscountCallback(times, discounts, callback);
    else callback(discounts);
    return true;
  });
}

function getDiscountPromise(times, discounts, callback) {
  generateDiscountPromisified()
    .then((discount) => {
      discounts.push(discount);
      if (discounts.length < times) getDiscountPromise(times, discounts, callback);
      else callback(discounts);
    })
    .catch(() => getDiscountPromise(times, discounts, callback));
}

async function getDiscountAsyncAwait() {
  try {
    return await generateDiscountPromise();
  } catch (err) {
    return getDiscountAsyncAwait();
  }
}

function createCsvToJson() {
  let isFirst = true;
  let head;
  let last = '';

  const transform = (chunk, encoding, callback) => {
    let result = '';
    let goods = chunk.toString().split('\n');

    if (isFirst) {
      head = goods.shift().split(',');
      const value = goods.shift().split(',');
      result =
        `[\n  {"${head[0]}": "${value[0]}", "${head[1]}": "${value[1]}", ` +
        `"${head[2]}": ${value[2]}, "${head[3]}": ${value[3]}}`;
      isFirst = false;
    }
    goods.unshift(...(last + goods.shift()).split('\n'));
    last = goods.pop();

    goods = goods.map((str) => {
      const value = str.split(',');
      return (
        `,\n  {"${head[0]}": "${value[0]}", "${head[1]}": "${value[1]}", ` +
        `"${head[2]}": ${value[2]}, "${head[3]}": ${value[3]}}`
      );
    });

    result += goods.join('');

    callback(null, result);
  };

  const flush = (callback) => {
    /* const value = last.split(',');
    const result =
      `  {"${head[0]}": "${value[0]}", "${head[1]}": "${value[1]}", ` +
      `"${head[2]}": ${value[2]}, "${head[3]}": ${value[3]}, "${head[4]}": ${value[4]}}\n]`; */

    const result = '\n]';
    callback(null, result);
  };

  return new Transform({ transform, flush });
}

module.exports = {
  getDiscountCallback,
  getDiscountPromise,
  getDiscountAsyncAwait,
  createCsvToJson,
};
