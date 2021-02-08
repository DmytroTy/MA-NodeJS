/* eslint-disable no-extend-native */
/* eslint-disable no-plusplus */
const fs = require('fs');
const db = require('../../db');
const { task3: standardize } = require('./goods');
const { STORE_FILE } = require('../../config');

global.store = [];
global.storageIn = 'database';

// eslint-disable-next-line consistent-return
async function readStorage(next) {
  try {
    // eslint-disable-next-line default-case
    switch (global.storageIn) {
      case 'database':
        return await db.getAllProducts();
      case 'json':
        return standardize(JSON.parse(fs.readFileSync(STORE_FILE, 'utf8')));
      case 'store':
        return standardize(global.store);
    }
  } catch (err) {
    console.error(err.message);
    return next(new Error('500 Server error'));
  }
}

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
    for (let index = 0; index < this.length; index++) {
      // eslint-disable-next-line no-await-in-loop
      result.push(await callback(this[index]));
    }
  } catch (err) {
    console.error(err);
  }
  return result;
}

Array.prototype.myMapAsync = myMapAsync;

function incorrectData(res) {
  res.status(406).json({ error: '406', message: '406 Incorrect data received!' });
}

function incorrectParameters(res) {
  res.status(406).json({ error: '406', message: '406 Incorrect parameters' });
}

module.exports = {
  incorrectData,
  incorrectParameters,
  readStorage,
};
