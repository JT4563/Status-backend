const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { requireRole, requireAdmin } = require('../middleware/requireRole');
const { ingestObjects } = require('../controllers/cctv.controller');

// Staff can submit object detection data from cameras
router.post('/objects', requireAuth, requireRole('staff', 'admin'), ingestObjects);

// Admin-only camera management routes (will be implemented)
// router.post('/cameras', requireAuth, requireAdmin, addCamera);
// router.put('/cameras/:id', requireAuth, requireAdmin, updateCamera);
// router.delete('/cameras/:id', requireAuth, requireAdmin, removeCamera);
// router.get('/cameras', requireAuth, requireAdmin, listCameras);

module.exports = router;
