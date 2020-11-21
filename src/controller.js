/* eslint-disable no-plusplus */
const fs = require('fs');
const path = require('path');
const { task1: filterGoods, task2: goodsWithMaxCost, task3 } = require('./task');
const { getDiscountCallback, getDiscountPromise, getDiscountAsyncAwait } = require('./service');

const pathToFile = path.resolve(__dirname, '../', 'goods.json');

let store = [];
let storageInJson = true;

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

function readStorage(response) {
  if (!storageInJson) return store;

  let goods;

  try {
    const rawdata = fs.readFileSync(pathToFile, 'utf8');
    goods = JSON.parse(rawdata);
  } catch (err) {
    console.error(err.message);
    serverError(response);
  }

  return goods;
}

function findGoods(response, queryParams) {
  const goods = filterGoods(readStorage(response), queryParams.parameter, queryParams.value);
  response.write(JSON.stringify(goods));
  response.end();
}

function findGoodsWithMaxCost(response) {
  const product = goodsWithMaxCost(readStorage(response));
  response.write(JSON.stringify(product));
  response.end();
}

function standardize(response) {
  const standard = task3(readStorage(response));
  response.write(JSON.stringify(standard));
  response.end();
}

function switchStorage(response, queryParams) {
  let message;
  switch (queryParams.storage) {
    case 'json':
      storageInJson = true;
      message = 'Storage is switched to JSON';
      break;
    case 'store':
      storageInJson = false;
      message = 'Storage is switched to a global variable';
      break;
    default:
      return incorrectData(response);
  }
  response.write(JSON.stringify({ message }));
  return response.end();
}

function newData(data, response) {
  if (
    !Array.isArray(data) ||
    data.length < 1 ||
    data.some((obj) => !obj.type || !obj.color || (!obj.price && !obj.priceForPair))
  )
    return incorrectData(response);

  try {
    if (!storageInJson) store = data;
    else fs.writeFileSync(pathToFile, JSON.stringify(data, null, 1));
  } catch (err) {
    console.error(err.message);
    serverError(response);
  }
  response.write(JSON.stringify(data));
  return response.end();
}

// Homework-03

function discountCallback(response) {
  const standard = task3(readStorage(response));
  let mapped = 0;
  function last() {
    // eslint-disable-next-line no-use-before-define
    if (mapped === standard.length) sendResponse();
  }
  const discountedGoods = standard.myMap((product) => {
    getDiscountCallback((discount) => {
      if (product.type === 'hat')
        getDiscountCallback((discount2) => {
          if (product.color === 'red')
            getDiscountCallback((discount3) => {
              const correction =
                (1 - discount / 100) * (1 - discount2 / 100) * (1 - discount3 / 100);
              const discont = Math.trunc((1 - correction) * 100);
              product.discount = `${discont}%`;
              mapped++;
              last();
            });
          else {
            const correction = (1 - discount / 100) * (1 - discount2 / 100);
            const discont = Math.trunc((1 - correction) * 100);
            product.discount = `${discont}%`;
            mapped++;
            last();
          }
        });
      else {
        product.discount = `${discount}%`;
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

function discountPromise(response) {
  const standard = task3(readStorage(response));
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
      if (mapped === standard.length) sendResponse(); // setTimeout(sendResponse, 1000);
    });

    return product;
  });

  function sendResponse() {
    response.write(JSON.stringify(discountedGoods));
    response.end();
  }
}

async function discountAsyncAwait(response) {
  const standard = task3(readStorage(response));
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
    response.write(JSON.stringify(discountedGoods));
    response.end();
  } catch (err) {
    console.error(err.message);
    serverError(response);
  }
}

module.exports = {
  findGoods,
  findGoodsWithMaxCost,
  discountCallback,
  discountPromise,
  discountAsyncAwait,
  standardize,
  newData,
  switchStorage,
};
