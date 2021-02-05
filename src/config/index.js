require('dotenv').config();

const { fatal } = require('../utils');

const config = {
  port: Number(process.env.PORT) || 3000,
  host: process.env.HOST || 'localhost',
  secretKey: process.env.ACCESS_TOKEN_SECRET || fatal('FATAL: ACCESS_TOKEN_SECRET is not defined'),
  apiKey: process.env.NOVA_POSHTA_API_KEY || fatal('FATAL: NOVA_POSHTA_API_KEY is not defined'),
  INTERVAL_OPTIMIZATION: Number(process.env.INTERVAL_OPTIMIZATION) || 600000,
  STORE_FILE: process.env.STORE_FILE || './goods.json',
  UPLOAD_DIR: process.env.DIR_UPLOAD || './upload',
  OPTIMIZED_DIR: process.env.DIR_OPTIMIZED || './upload/optimized',
  db: {
    defaultType: process.env.DB_WRAPPER_TYPE || 'pg',
    config: {
      knex: {
        client: 'postgresql',
        connection: {
          user: process.env.POSTGRES_USER || fatal('FATAL: POSTGRES_USER is not defined'),
          host: process.env.POSTGRES_HOST || fatal('FATAL: DB_HOST is not defined'),
          port: Number(process.env.POSTGRES_PORT) || fatal('FATAL: DB_PORT is not defined'),
          database: process.env.POSTGRES_DB || fatal('FATAL: POSTGRES_DB is not defined'),
          password:
            process.env.POSTGRES_PASSWORD || fatal('FATAL: POSTGRES_PASSWORD is not defined'),
        },
        pool: {
          min: 2,
          max: 10,
        },
        debug: true,
      },

      pg: {
        user: process.env.POSTGRES_USER || fatal('FATAL: POSTGRES_USER is not defined'),
        host: process.env.POSTGRES_HOST || fatal('FATAL: DB_HOST is not defined'),
        port: Number(process.env.POSTGRES_PORT) || fatal('FATAL: DB_PORT is not defined'),
        database: process.env.POSTGRES_DB || fatal('FATAL: POSTGRES_DB is not defined'),
        password: process.env.POSTGRES_PASSWORD || fatal('FATAL: POSTGRES_PASSWORD is not defined'),
      },

      sequelize: {
        dialect: 'postgres',
        username: process.env.POSTGRES_USER || fatal('FATAL: POSTGRES_USER is not defined'),
        host: process.env.POSTGRES_HOST || fatal('FATAL: DB_HOST is not defined'),
        port: Number(process.env.POSTGRES_PORT) || fatal('FATAL: DB_PORT is not defined'),
        database: process.env.POSTGRES_DB || fatal('FATAL: POSTGRES_DB is not defined'),
        password: process.env.POSTGRES_PASSWORD || fatal('FATAL: POSTGRES_PASSWORD is not defined'),
        logging: true,
        pool: {
          min: 0,
          max: 10,
          idle: 5000,
          acquire: 5000,
          evict: 5000,
        },
      },
    },
  },
};

module.exports = config;
