const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { ingestObjects } = require('../controllers/cctv.controller');

router.post('/objects', requireAuth, requireRole('admin','staff'), ingestObjects);

module.exports = router;
