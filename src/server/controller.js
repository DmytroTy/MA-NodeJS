/* eslint-disable no-plusplus */
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { createGunzip } = require('zlib');
const { pipeline } = require('stream');
const { nanoid } = require('nanoid');
const { task1: filterGoods, task2: goodsWithMaxCost, task3 } = require('../task');
const {
  getDiscountCallback,
  getDiscountPromise,
  getDiscountAsyncAwait,
  createCsvToJson,
  csvOptimization,
  readFolder,
} = require('./service');

const pathToFile = path.resolve(__dirname, '../../', 'goods.json');

const { DIR_UPLOAD, DIR_OPTIMIZED } = process.env;

const promisifiedPipeline = promisify(pipeline);

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

async function uploadCsv(inputStream) {
  const gunzip = createGunzip();

  const timestamp = Date.now();
  const id = nanoid(5);
  try {
    await fs.promises.mkdir(DIR_UPLOAD, { recursive: true });
  } catch (err) {
    console.error(`Failed to create folder ${DIR_UPLOAD}!`, err);
    return err;
  }
  const filePath = path.resolve(DIR_UPLOAD, `${timestamp}_${id}.json`);
  const outputStream = fs.createWriteStream(filePath);

  const csvToJson = createCsvToJson();

  try {
    return await promisifiedPipeline(inputStream, gunzip, csvToJson, outputStream);
  } catch (err) {
    console.error('CSV pipeline failed', err);
    return err;
  }
}

async function getStores(response) {
  try {
    const files = await readFolder(DIR_UPLOAD);
    const result = { upload: files };
    const filesOptimized = await readFolder(DIR_OPTIMIZED);
    result.optimized = filesOptimized;
    response.write(JSON.stringify(result));
    response.end();
  } catch (err) {
    console.error(err.message);
    serverError(response);
  }
}

function optimizeCsv(url, response) {
  const fileName = url.slice(url.lastIndexOf('/') + 1);
  response.write(JSON.stringify({ status: '202 Accepted' }));
  response.end();
  csvOptimization(fileName);
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
