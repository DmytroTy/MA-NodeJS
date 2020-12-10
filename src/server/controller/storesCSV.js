const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { createGunzip } = require('zlib');
const { pipeline } = require('stream');
const { nanoid } = require('nanoid');
const { UPLOAD_DIR, OPTIMIZED_DIR } = require('../../config');
const { createCsvToJson, csvOptimization, readFolder } = require('../service/storesCSV');

const promisifiedPipeline = promisify(pipeline);

async function uploadCsv(inputStream, next) {
  const gunzip = createGunzip();

  const timestamp = Date.now();
  const id = nanoid(5);
  try {
    await fs.promises.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (err) {
    console.error(`Failed to create folder ${UPLOAD_DIR}!`, err);
    return next(new Error('500 Failed to create folder'));
  }
  const filePath = path.resolve(UPLOAD_DIR, `${timestamp}_${id}.json`);
  const outputStream = fs.createWriteStream(filePath);

  const csvToJson = createCsvToJson();

  try {
    return await promisifiedPipeline(inputStream, gunzip, csvToJson, outputStream);
  } catch (err) {
    console.error('CSV pipeline failed', err);
    return next(new Error('500 CSV pipeline failed'));
  }
}

async function getStores(res, next) {
  try {
    const files = await readFolder(UPLOAD_DIR, next);
    const filesOptimized = await readFolder(OPTIMIZED_DIR, next);
    const result = { upload: files, optimized: filesOptimized };

    res.json(result);
  } catch (err) {
    console.error(err.message);
    next(new Error('500 Server error'));
  }
}

async function optimizeCsv(fileName, res) {
  try {
    const filePath = path.resolve(UPLOAD_DIR, fileName);
    await fs.promises.access(filePath);

    res.status(202).json({ status: '202 Accepted' });
  } catch (error) {
    res.status(404).json({ error: '404', message: `404 File ${fileName} not found!` });
    return;
  }
  csvOptimization(fileName).catch(console.error);
}

module.exports = {
  getStores,
  optimizeCsv,
  uploadCsv,
};
