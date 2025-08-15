const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { aiInsights, aiPredictions } = require('../controllers/ai.controller');

router.get('/ai-insights', requireAuth, aiInsights);
router.get('/ai-predictions', requireAuth, aiPredictions);

module.exports = router;
