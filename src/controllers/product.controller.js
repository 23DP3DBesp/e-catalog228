const { matchedData } = require('express-validator');
const productService = require('../services/product.service');

async function list(req, res, next) {
  try {
    const filters = matchedData(req, { locations: ['query'] });
    res.json(await productService.listProducts(filters));
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const { id } = matchedData(req, { locations: ['params'] });
    res.json(await productService.getProduct(id));
  } catch (err) {
    next(err);
  }
}

async function getOffers(req, res, next) {
  try {
    const { id } = matchedData(req, { locations: ['params'] });
    res.json(await productService.getProductOffers(id));
  } catch (err) {
    next(err);
  }
}

async function facets(req, res, next) {
  try {
    res.json(await productService.getFacets());
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, getOffers, facets };
