const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { createPing } = require('../controllers/pings.controller');

// allow staff-authenticated device to POST pings
router.post('/', requireAuth, createPing);

module.exports = router;
