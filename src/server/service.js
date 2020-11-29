/* eslint-disable no-await-in-loop */
/* eslint-disable no-extend-native */
/* eslint-disable no-plusplus */
const { promisify } = require('util');
const { Transform } = require('stream');
const fs = require('fs');
const path = require('path');
const { once } = require('events');

const { DIR_UPLOAD, DIR_OPTIMIZED } = process.env;

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
      result.push(await callback(this[index]));
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
    let result = ',\n';
    let goods = chunk.toString().split('\n');

    if (isFirst) {
      head = goods.shift().split(',');
      result = '[\n';
      isFirst = false;
    }
    goods.unshift(...(last + goods.shift()).split('\n'));
    last = goods.pop();

    goods = goods.map((str) => {
      const value = str.split(',');
      return (
        `  {"${head[0]}": "${value[0]}", "${head[1]}": "${value[1]}", ` +
        `"${head[2]}": ${value[2]}, "${head[3]}": ${value[3]}}`
      );
    });

    if (goods.length > 0) result += goods.join(',\n');
    else result = '';

    callback(null, result);
  };

  const flush = (callback) => callback(null, '\n]');

  return new Transform({ transform, flush });
}

function stringToObject(str, optimized) {
  let strNew;
  if (str.charAt(str.length - 1) !== ',') strNew = str.slice(3, -1);
  else strNew = str.slice(3, str.length - 2);

  let value = strNew.split(',');
  value = value.map((strI) => strI.slice(strI.indexOf(':') + 2));
  value[0] = value[0].slice(1, -1);
  value[1] = value[1].slice(1, -1);
  value[2] = Number(value[2]);
  value[3] = Number(value[3]);

  const product = { type: value[0], color: value[1], quantity: value[2], price: value[3] };
  const index = `${product.type}_${product.color}_${product.price}`;

  if (!optimized.has(index)) optimized.set(index, product);
  else optimized.get(index).quantity += product.quantity;
}

async function writeResultToFile(fileName, optimized) {
  try {
    await fs.promises.mkdir(DIR_OPTIMIZED, { recursive: true });
  } catch (err) {
    console.error(`Failed to create folder ${DIR_OPTIMIZED}!`, err);
    return err;
  }
  let filePath = path.resolve(DIR_OPTIMIZED, fileName);
  const streamWriting = fs.createWriteStream(filePath);

  streamWriting.on('error', (err) => {
    console.error('Failed to write file!', err);
    return err;
  });

  streamWriting.write('[');
  let totalQuantity = 0;
  let isFirst = true;
  // eslint-disable-next-line no-restricted-syntax
  for await (const [, product] of optimized) {
    let result = ',\n';
    if (isFirst) {
      isFirst = false;
      result = '\n';
    }
    result +=
      `  {"type": "${product.type}", "color": "${product.color}", ` +
      `"quantity": ${product.quantity}, "price": ${product.price}}`;

    totalQuantity += product.quantity;
    const canWrite = streamWriting.write(result);
    if (!canWrite) await once(streamWriting, 'drain');
  }
  streamWriting.end('\n]');
  console.log(`Successful CSV file optimization. Total quantity = ${totalQuantity}`);

  filePath = path.resolve(DIR_UPLOAD, fileName);
  fs.rm(filePath, (error) => {
    if (error) console.error(`Failed to delete file ${filePath}!`, error);
  });
  return true;
}

function csvOptimization(fileName) {
  return new Promise((resolve, reject) => {
    const filePath = path.resolve(DIR_UPLOAD, fileName);

    const streamReading = fs.createReadStream(filePath, 'utf8');

    const optimized = new Map();
    let isFirst = true;
    let last = '';

    streamReading.on('data', (chunk) => {
      const goods = chunk.split('\n');

      if (isFirst) {
        goods.shift();
        isFirst = false;
      }
      goods.unshift(...(last + goods.shift()).split('\n'));
      last = goods.pop();

      for (let index = 0; index < goods.length; index++) {
        stringToObject(goods[index], optimized);
      }
    });

    streamReading.on('end', async () => {
      await writeResultToFile(fileName, optimized);
      resolve();
    });

    streamReading.on('error', (err) => {
      console.error('Failed to read file!', err);
      reject(err);
    });
  });
}

function autoOptimizationCsv() {
  fs.readdir(DIR_UPLOAD, async (err, files) => {
    if (err) console.error('Failed to read folder!', err);

    const index = files.indexOf('optimized');
    if (index !== -1) files.splice(index, 1);
    for (let i = 0; i < files.length; i++) {
      try {
        let isOptimized;
        try {
          const filePath = path.resolve(DIR_OPTIMIZED, files[i]);
          await fs.promises.access(filePath);
          isOptimized = true;
        } catch (error) {
          isOptimized = false;
        }
        if (!isOptimized) await csvOptimization(files[i]);
        else {
          const filePath = path.resolve(DIR_UPLOAD, files[i]);
          fs.rm(filePath, (error) => {
            if (error) console.error(`Failed to delete file ${filePath}!`, error);
          });
        }
      } catch (error) {
        console.error('CSV auto-optimization failed!', error);
      }
    }
  });
}

async function readFolder(folderPath) {
  let files;
  try {
    files = await fs.promises.readdir(folderPath, { withFileTypes: true });
  } catch (err) {
    console.error(`Failed to read folder ${folderPath}!`, err);
    return err;
  }
  let indexFolder;
  files.forEach((file, index) => {
    if (file.name === 'optimized') indexFolder = index;
  });
  if (indexFolder !== -1) files.splice(indexFolder, 1);

  for (let i = 0; i < files.length; i++) {
    const filePath = path.resolve(folderPath, files[i].name);
    try {
      const stats = await fs.promises.stat(filePath);
      files[i].size = stats.size;
      files[i].create_time = stats.ctime;
    } catch (error) {
      console.error(`Failed to read file ${filePath}!`, error);
      return error;
    }
  }
  return files;
}

module.exports = {
  getDiscountCallback,
  getDiscountPromise,
  getDiscountAsyncAwait,
  createCsvToJson,
  csvOptimization,
  autoOptimizationCsv,
  readFolder,
};
