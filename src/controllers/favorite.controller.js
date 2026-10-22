const { matchedData } = require('express-validator');
const favoriteService = require('../services/favorite.service');

async function list(req, res, next) {
  try {
    res.json(await favoriteService.listFavorites(req.user.id));
  } catch (err) {
    next(err);
  }
}

async function ids(req, res, next) {
  try {
    res.json(await favoriteService.listFavoriteIds(req.user.id));
  } catch (err) {
    next(err);
  }
}

async function add(req, res, next) {
  try {
    const { productId } = matchedData(req, { locations: ['params'] });
    res.json(await favoriteService.addFavorite(req.user.id, productId));
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { productId } = matchedData(req, { locations: ['params'] });
    res.json(await favoriteService.removeFavorite(req.user.id, productId));
  } catch (err) {
    next(err);
  }
}

module.exports = { list, ids, add, remove };