const { matchedData } = require('express-validator');
const orderService = require('../services/order.service');

async function list(req, res, next) {
  try {
    const filters = matchedData(req, { locations: ['query'] });
    res.json(await orderService.listAllOrders(filters));
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { id } = matchedData(req, { locations: ['params'] });
    const { status } = matchedData(req, { locations: ['body'] });
    res.json(await orderService.updateOrderStatus(id, status, req.user));
  } catch (err) {
    next(err);
  }
}

module.exports = { list, updateStatus };