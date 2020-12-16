require('dotenv').config();

const { fatal } = require('../utils');

const config = {
  port: Number(process.env.PORT) || 3000,
  host: process.env.HOST || 'localhost',
  INTERVAL_OPTIMIZATION: Number(process.env.INTERVAL_OPTIMIZATION) || 600000,
  STORE_FILE: process.env.STORE_FILE || './goods.json',
  UPLOAD_DIR: process.env.DIR_UPLOAD || './upload',
  OPTIMIZED_DIR: process.env.DIR_OPTIMIZED || './upload/optimized',
  db: {
    user: process.env.POSTGRES_USER || fatal('FATAL: POSTGRES_USER is not defined'),
    host: process.env.POSTGRES_HOST || fatal('FATAL: DB_HOST is not defined'),
    port: Number(process.env.POSTGRES_PORT) || fatal('FATAL: DB_PORT is not defined'),
    database: process.env.POSTGRES_DB || fatal('FATAL: POSTGRES_DB is not defined'),
    password: process.env.POSTGRES_PASSWORD || fatal('FATAL: POSTGRES_PASSWORD is not defined'),
  },
};

module.exports = config;
