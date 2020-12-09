require('dotenv').config();

const config = {
  port: Number(process.env.PORT) || 3000,
  host: process.env.HOST || 'localhost',
  INTERVAL_OPTIMIZATION: Number(process.env.INTERVAL_OPTIMIZATION) || 600000,
  STORE_FILE: process.env.STORE_FILE || './goods.json',
  UPLOAD_DIR: process.env.DIR_UPLOAD || './upload',
  OPTIMIZED_DIR: process.env.DIR_OPTIMIZED || './upload/optimized',
};

module.exports = config;
