const { matchedData } = require('express-validator');
const vehicleService = require('../services/vehicle.service');

async function brands(req, res, next) {
  try {
    res.json(await vehicleService.listBrands());
  } catch (err) {
    next(err);
  }
}

async function models(req, res, next) {
  try {
    const { brand } = matchedData(req, { locations: ['query'] });
    res.json(await vehicleService.listModels(brand));
  } catch (err) {
    next(err);
  }
}

async function years(req, res, next) {
  try {
    const { brand, model } = matchedData(req, { locations: ['query'] });
    res.json(await vehicleService.listYears(brand, model));
  } catch (err) {
    next(err);
  }
}

async function modifications(req, res, next) {
  try {
    const { brand, model, year } = matchedData(req, { locations: ['query'] });
    res.json(await vehicleService.listModifications(brand, model, year));
  } catch (err) {
    next(err);
  }
}

module.exports = { brands, models, years, modifications };