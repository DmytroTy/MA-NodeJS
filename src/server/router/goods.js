const express = require('express');
const asyncHandler = require('express-async-handler');
const { incorrectParameters, incorrectData } = require('.');
const db = require('../../db');
const {
  findGoods,
  findGoodsWithMaxCost,
  standardizeGoods,
  newData,
  switchStorage,
} = require('../controller/goods');

const goods = express.Router();

goods.get(
  '/',
  asyncHandler(async (req, res, next) => {
    if (!req.query.parameter || !req.query.value) {
      incorrectParameters(res);
      return;
    }

    await findGoods(req, res, next);
  }),
);

goods.put(
  '/',
  asyncHandler(async (req, res, next) => {
    if (!req.body.id || !req.body.type || !req.body.color || !req.body.price) {
      incorrectData(res);
      return;
    }

    try {
      const product = await db.updateProduct(req.body);
      res.json(product);
    } catch (err) {
      console.error(err.message);
      next(new Error('500 Server error'));
    }
  }),
);

goods.get(
  '/with-max-cost',
  asyncHandler(async (req, res, next) => {
    await findGoodsWithMaxCost(res, next);
  }),
);

goods.get(
  '/standardize',
  asyncHandler(async (req, res, next) => {
    await standardizeGoods(res, next);
  }),
);

goods.get('/switch', (req, res) => {
  switchStorage(req, res);
});

goods.post(
  '/new-data',
  asyncHandler(async (req, res, next) => {
    await newData(req, res, next);
  }),
);

goods.get(
  '/:id',
  asyncHandler(async (req, res, next) => {
    let { id } = req.params;
    id = Number(id);

    if (!id) {
      incorrectParameters(res);
      return;
    }

    try {
      const product = await db.getProduct(id);

      if (!product) {
        res.status(404).json({ error: '404', message: `404 Product with id: ${id} not found!` });
        return;
      }

      res.json(product);
    } catch (err) {
      console.error(err.message);
      next(new Error('500 Server error'));
    }
  }),
);

goods.delete(
  '/:id',
  asyncHandler(async (req, res, next) => {
    let { id } = req.params;
    id = Number(id);

    if (!id) {
      incorrectParameters(res);
      return;
    }

    try {
      await db.deleteProduct(id);
      res.status(204).json({ status: '204 No Content' });
    } catch (err) {
      console.error(err.message);
      next(new Error('500 Server error'));
    }
  }),
);

module.exports = goods;
