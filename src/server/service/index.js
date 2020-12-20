/* eslint-disable no-extend-native */
/* eslint-disable no-plusplus */
const fs = require('fs');
const { STORE_FILE } = require('../../config');

global.store = [];
global.storageInJson = true;

function readStorage(next) {
  if (!global.storageInJson) return global.store;

  try {
    const rawdata = fs.readFileSync(STORE_FILE, 'utf8');
    return JSON.parse(rawdata);
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

module.exports = {
  readStorage,
};
