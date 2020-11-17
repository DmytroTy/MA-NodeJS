/* eslint-disable no-plusplus */
const fs = require('fs');
const path = require('path');
const util = require('util');
const { task1: filterGoods, task2: goodsWithMaxCost, task3 } = require('./task');

const pathToFile = path.resolve(__dirname, '../', 'goods.json');

function incorrectData(response) {
  response.statusCode = 406;
  response.write(JSON.stringify({ error: '406', message: '406 Incorrect data recived' }));
  response.end();
}

function serverError(response) {
  response.statusCode = 500;
  response.write(JSON.stringify({ error: '500', message: '500 Server error' }));
  response.end();
}

function readFileStorage(response) {
  let rawdata;
  let goods;
  try {
    rawdata = fs.readFileSync(pathToFile, 'utf8');
    goods = JSON.parse(rawdata);
  } catch (err) {
    console.error(err.message);
    serverError(response);
  }

  return goods;
}

function findGoods(response, queryParams) {
  const goods = filterGoods(readFileStorage(response), queryParams.parameter, queryParams.value);
  response.write(JSON.stringify(goods));
  response.end();
}

function findGoodsWithMaxCost(response) {
  const product = goodsWithMaxCost(readFileStorage(response));
  response.write(JSON.stringify(product));
  response.end();
}

function standardize(response) {
  const standard = task3(readFileStorage(response));
  response.write(JSON.stringify(standard));
  response.end();
}

function newData(data, response) {
  if (
    !Array.isArray(data) ||
    data.length < 1 ||
    data.some((obj) => !obj.type || !obj.color || (!obj.price && !obj.priceForPair))
  )
    return incorrectData(response);
  try {
    fs.writeFileSync(pathToFile, JSON.stringify(data, null, 1));
  } catch (err) {
    console.error(err.message);
    serverError(response);
  }
  response.write(JSON.stringify(data));
  return response.end();
}

// Homework-03

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

function generateDiscountPromise(...args) {
  return new Promise((resolve, reject) =>
    generateDiscount((error, discount) => (error ? reject(error) : resolve(discount, ...args))),
  );
}

function getDiscountCallback(callback) {
  generateDiscount((err, discount) => (err ? getDiscountCallback(callback) : callback(discount)));
}

function discountCallback(response) {
  const standard = task3(readFileStorage(response));
  let mapped = 0;
  function last() {
    // eslint-disable-next-line no-use-before-define
    if (mapped === standard.length) sendResponse();
  }
  const discountedGoods = myMap(standard, (product) => {
    getDiscountCallback((discount) => {
      if (product.type === 'hat')
        getDiscountCallback((discount2) => {
          if (product.color === 'red')
            getDiscountCallback((discount3) => {
              const correction =
                (1 - discount / 100) * (1 - discount2 / 100) * (1 - discount3 / 100);
              product.price = `$${+product.price.slice(1) * correction}`;
              mapped++;
              last();
            });
          else {
            const correction = (1 - discount / 100) * (1 - discount2 / 100);
            product.price = `$${+product.price.slice(1) * correction}`;
            mapped++;
            last();
          }
        });
      else {
        product.price = `$${+product.price.slice(1) * (1 - discount / 100)}`;
        mapped++;
        last();
      }
    });

    return product;
  });
  function sendResponse() {
    response.write(JSON.stringify(discountedGoods));
    response.end();
  }
}

function getDiscountPromise(callback) {
  generateDiscountPromisified()
    .then((discount) => callback(discount))
    .catch(() => getDiscountPromise(callback));
}

function discountPromise(response) {
  const standard = task3(readFileStorage(response));
  let mapped = 0;
  function last() {
    // eslint-disable-next-line no-use-before-define
    if (mapped === standard.length) sendResponse();
  }
  const discountedGoods = myMap(standard, (product) => {
    getDiscountPromise((discount) => {
      if (product.type === 'hat')
        getDiscountPromise((discount2) => {
          if (product.color === 'red')
            getDiscountPromise((discount3) => {
              const correction =
                (1 - discount / 100) * (1 - discount2 / 100) * (1 - discount3 / 100);
              product.price = `$${+product.price.slice(1) * correction}`;
              mapped++;
              last();
            });
          else {
            const correction = (1 - discount / 100) * (1 - discount2 / 100);
            product.price = `$${+product.price.slice(1) * correction}`;
            mapped++;
            last();
          }
        });
      else {
        product.price = `$${+product.price.slice(1) * (1 - discount / 100)}`;
        mapped++;
        last();
      }
    });

    /* // Not works
    (function getDiscountPromise() {
      generateDiscountPromise()
        .then((discount) => {
          if (product.type === 'hat') generateDiscountPromise(discount);
          else {
            product.price = `$${+product.price.slice(1) * (1 - discount / 100)}`;
            mapped++;
            last();
          }
        })
        .catch((err) => {
          getDiscountPromise();
          void err;
        })
        .then((discount2, discount) => {
          if (product.color === 'red') generateDiscountPromise(discount2, discount);
          else {
            const correction = (1 - discount / 100) * (1 - discount2 / 100);
            product.price = `$${+product.price.slice(1) * correction}`;
            mapped++;
            last();
          }
        })
        .catch((err) => {
          getDiscountPromise();
          void err;
        })
        .then((discount3, discount2, discount) => {
          const correction = (1 - discount / 100) * (1 - discount2 / 100) * (1 - discount3 / 100);
          product.price = `$${+product.price.slice(1) * correction}`;
          mapped++;
          last();
        })
        .catch((err) => {
          getDiscountPromise();
          void err;
        });
    })(); */

    return product;
  });
  function sendResponse() {
    response.write(JSON.stringify(discountedGoods));
    response.end();
  }
}

async function getDiscountAsyncAwait() {
  let discount;
  try {
    discount = 1 - (await generateDiscountPromise()) / 100;
    return discount;
  } catch (err) {
    return getDiscountAsyncAwait();
  }
}

async function discountAsyncAwait(response) {
  const standard = task3(readFileStorage(response));
  const discountedGoods = await myMapAsync(standard, async (product) => {
    let discount = await getDiscountAsyncAwait();
    if (product.type === 'hat') {
      discount *= await getDiscountAsyncAwait();
      if (product.color === 'red') discount *= await getDiscountAsyncAwait();
    }
    product.price = `$${+product.price.slice(1) * discount}`;

    return product;
  });
  response.write(JSON.stringify(discountedGoods));
  response.end();
}

module.exports = {
  findGoods,
  findGoodsWithMaxCost,
  discountCallback,
  discountPromise,
  discountAsyncAwait,
  standardize,
  newData,
};
