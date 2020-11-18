/* eslint-disable no-plusplus */
const fs = require('fs');
const path = require('path');
const {
  task1: filterGoods,
  task2: goodsWithMaxCost,
  task3,
  task4: { myMap, myMapAsync, getDiscountCallback, getDiscountPromise, getDiscountAsyncAwait },
} = require('./task');

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
  const standard = task3(readFileStorage(response));
  let mapped = 0;

  function last() {
    // eslint-disable-next-line no-use-before-define
    if (mapped === standard.length) setTimeout(sendResponse, 1000);
  }

  const discountedGoods = myMap(standard, (product) => {
    let times = 1;
    if (product.type === 'hat')
      if (product.color === 'red') times = 3;
      else times = 2;

    getDiscountPromise(times, (discounts) => {
      const correction = discounts.reduce((before, discount) => before * (1 - discount / 100), 1);
      const discount = Math.trunc((1 - correction) * 100);
      product.discount = `${discount}%`;
      mapped++;
      last();
    });

    return product;
  });

  function sendResponse() {
    response.write(JSON.stringify(discountedGoods));
    response.end();
  }
}

async function discountAsyncAwait(response) {
  const standard = task3(readFileStorage(response));
  const discountedGoods = await myMapAsync(standard, async (product) => {
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
