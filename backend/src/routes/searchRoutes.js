const express = require('express');
const router = express.Router();

const searchController = require('../controllers/searchController');
const { optionalAuth } = require('../middleware/optionalAuth');

router.get('/', optionalAuth, searchController.globalSearch);

module.exports = router;
