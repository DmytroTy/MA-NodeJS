/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
const { Transform } = require('stream');
const fs = require('fs');
const path = require('path');
const { once } = require('events');
const db = require('../../db');

const { UPLOAD_DIR, OPTIMIZED_DIR } = process.env;

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
    await fs.promises.mkdir(OPTIMIZED_DIR, { recursive: true });
  } catch (err) {
    console.error(`Failed to create folder ${OPTIMIZED_DIR}!`, err.message);
    return err;
  }
  let filePath = path.resolve(OPTIMIZED_DIR, fileName);
  const streamWriting = fs.createWriteStream(filePath);

  streamWriting.on('error', (err) => {
    console.error('Failed to write file!', err.message);
    return err;
  });

  streamWriting.write('[');
  let totalQuantity = 0;
  let isFirst = true;
  for (const [, product] of optimized) {
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

  filePath = path.resolve(UPLOAD_DIR, fileName);
  fs.rm(filePath, (error) => {
    if (error) console.error(`Failed to delete file ${filePath}!`, error);
  });
  return true;
}

async function writeResultToDB(filePath, optimized) {
  for (const [, product] of optimized) {
    await db.upsertProduct(product);
  }

  fs.rm(filePath, (error) => {
    if (error) console.error(`Failed to delete file ${filePath}!`, error);
  });

  return true;
}

function csvOptimization(fileName) {
  return new Promise((resolve, reject) => {
    const filePath = path.resolve(UPLOAD_DIR, fileName);

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
      if (global.storageIn !== 'database') {
        writeResultToFile(fileName, optimized).then(resolve).catch(reject);
      } else {
        writeResultToDB(filePath, optimized).then(resolve).catch(reject);
      }
    });

    streamReading.on('error', (err) => {
      console.error('Failed to read file!', err.message);
      reject(err);
    });
  });
}

async function autoOptimizationCsv(server) {
  let contents;
  try {
    contents = await fs.promises.readdir(UPLOAD_DIR, { withFileTypes: true });
  } catch (err) {
    console.error('Failed to read folder!', err);
    return;
  }
  const files = contents.filter((file) => file.isFile());
  for (let i = 0; i < files.length; i++) {
    try {
      let isOptimized;
      try {
        const filePath = path.resolve(OPTIMIZED_DIR, files[i].name);
        await fs.promises.access(filePath);
        isOptimized = true;
      } catch (error) {
        isOptimized = false;
      }
      if (!isOptimized) {
        if (server.listening) await csvOptimization(files[i].name);
      } else {
        const filePath = path.resolve(UPLOAD_DIR, files[i].name);
        fs.rm(filePath, (error) => {
          if (error) console.error(`Failed to delete file ${filePath}!`, error);
        });
      }
    } catch (error) {
      console.error('CSV auto-optimization failed!', error);
    }
  }
}

async function readFolder(folderPath, next) {
  let files;
  try {
    files = await fs.promises.readdir(folderPath, { withFileTypes: true });
  } catch (err) {
    console.error(`Failed to read folder ${folderPath}!`, err);
    return next(new Error('500 Failed to read folder'));
  }
  files = files.filter((file) => file.isFile());

  for (let i = 0; i < files.length; i++) {
    const filePath = path.resolve(folderPath, files[i].name);
    try {
      const stats = await fs.promises.stat(filePath);
      files[i].size = stats.size;
      files[i].create_time = stats.ctime;
    } catch (error) {
      console.error(`Failed to read file ${filePath}!`, error);
      return next(new Error('500 Failed to read file'));
    }
  }
  return files;
}

module.exports = {
  createCsvToJson,
  csvOptimization,
  autoOptimizationCsv,
  readFolder,
};
