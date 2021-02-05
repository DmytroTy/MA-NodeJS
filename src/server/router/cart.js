const express = require('express');
const asyncHandler = require('express-async-handler');
const { incorrectParameters, incorrectData } = require('../service');
const db = require('../../db');
const { calculateShippingCost } = require('../controller/cart');

const cart = express.Router();

cart.post(
  '/',
  asyncHandler(async (req, res) => {
    if (!req.body || !req.body.goods || !req.body.goods.length) {
      incorrectData(res);
      return;
    }

    const order = await db.upsertOrder(req.body.id, req.user.id, req.body.goods);
    res.json(order);
  }),
);

cart.get(
  '/shipping-cost',
  asyncHandler(async (req, res, next) => {
    if (!req.query || !req.query.id || !req.query.city) {
      incorrectParameters(res);
      return;
    }

    await calculateShippingCost(req.query.id, req.query.city, res, next);
  }),
);

cart.put(
  '/:action',
  asyncHandler(async (req, res) => {
    if (!req.body || !req.body.id) {
      incorrectData(res);
      return;
    }

    let order;
    switch (req.params.action) {
      case 'confirmate':
        order = await db.confirmateOrder(req.body.id);
        // await sendOrder(req.body.id);
        break;
      case 'cancel':
        order = await db.cancelOrder(req.body.id);
        break;
      default:
        res.sendStatus(404);
        return;
    }
    res.json(order);
  }),
);

module.exports = cart;
