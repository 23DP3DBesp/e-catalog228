const { matchedData } = require('express-validator');
const orderService = require('../services/order.service');

async function create(req, res, next) {
  try {
    const { items, customer } = matchedData(req, { locations: ['body'] });
    res.status(201).json(await orderService.createOrder(req.user.id, { items, customer }));
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    res.json(await orderService.listOrders(req.user.id));
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const { id } = matchedData(req, { locations: ['params'] });
    res.json(await orderService.getOrder(id, req.user));
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, getOne };