const { db: dbConfig } = require('../config');
const db = require('./pg')(dbConfig);

module.exports = db;
