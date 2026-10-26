const { matchedData } = require('express-validator');
const profileService = require('../services/profile.service');

async function getProfile(req, res, next) {
  try {
    res.json(await profileService.getProfile(req.user));
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { displayName } = matchedData(req, { locations: ['body'] });
    res.json(await profileService.updateProfile(req.user, { displayName }));
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile };