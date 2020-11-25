/* eslint-disable no-plusplus */
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { createGunzip } = require('zlib');
const { pipeline } = require('stream');
const { nanoid } = require('nanoid');
const { task1: filterGoods, task2: goodsWithMaxCost, task3 } = require('./task');
const {
  getDiscountCallback,
  getDiscountPromise,
  getDiscountAsyncAwait,
  createCsvToJson,
} = require('./service');

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

  try {
    const rawdata = fs.readFileSync(pathToFile, 'utf8');
    return JSON.parse(rawdata);
  } catch (err) {
    console.error(err.message);
    return serverError(response);
  }
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
    return serverError(response);
  }
  response.write(JSON.stringify(data));
  return response.end();
}

// Homework-03

function discountCallback(response) {
  const standard = task3(readStorage(response));
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
      if (mapped === standard.length) sendResponse();
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

const promisifiedPipeline = promisify(pipeline);

async function uploadCsv(inputStream) {
  const gunzip = createGunzip();

  const timestamp = Date.now();
  const id = nanoid(5);
  const filePath = `./upload/${timestamp}_${id}.json`;
  const outputStream = fs.createWriteStream(filePath);

  const csvToJson = createCsvToJson();

  try {
    await promisifiedPipeline(inputStream, gunzip, csvToJson, outputStream);
  } catch (err) {
    console.error('CSV pipeline failed', err);
  }
}

function getStores(response) {
  fs.readdir('./upload', (err, files) => {
    if (err) {
      console.error(err);
      return serverError(response);
    }

    response.write(JSON.stringify(files));
    return response.end();
  });
}

async function optimizeCsv(url, response) {
  const fileName = url.slice(url.lastIndexOf('/') + 1);
  let filePath = path.resolve('./upload/', fileName);

  const streamReading = fs.createReadStream(filePath);

  const optimized = new Map();
  let isFirst = true;
  let last = '';

  streamReading.on('data', (chunk) => {
    const goods = chunk.toString().split('\n');

    if (isFirst) {
      goods.shift();
      isFirst = false;
    }
    goods.unshift(...(last + goods.shift()).split('\n'));
    last = goods.pop();

    goods.forEach((str) => {
      let strNew;
      if (str.charAt(str.length - 1) !== ',') strNew = str.slice(2);
      else strNew = str.slice(2, str.length - 1);

      const product = JSON.parse(strNew);
      const index = `${product.type}_${product.color}_${product.price}`;

      if (!optimized.has(index)) optimized.set(index, product);
      else optimized.get(index).quantity += product.quantity;
    });
  });

  streamReading.on('end', () => {
    const result = [];
    let totalQuantity = 0;
    // eslint-disable-next-line no-restricted-syntax
    for (const [, product] of optimized) {
      result.push(product);
      totalQuantity += product.quantity;
    }
    filePath = path.resolve('./upload/optimized/', fileName);
    fs.writeFile(filePath, JSON.stringify(result, null, 1), (err) => {
      if (err) {
        console.error(err);
        return serverError(response);
      }
      response.write(JSON.stringify({ totalQuantity }));
      return response.end();
    });
  });

  streamReading.on('error', (err) => console.error(err));
}

module.exports = {
  findGoods,
  findGoodsWithMaxCost,
  discountCallback,
  discountPromise,
  discountAsyncAwait,
  standardize,
  getStores,
  newData,
  switchStorage,
  optimizeCsv,
  uploadCsv,
};
