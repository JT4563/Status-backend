const router = require('express').Router();
const { getMap } = require('../controllers/map.controller');

router.get('/', getMap);

module.exports = router;
