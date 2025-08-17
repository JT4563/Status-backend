const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/requireRole");
const { aiInsights, aiPredictions } = require("../controllers/ai.controller");

// Admin-only AI routes - sensitive AI data requires administrator access
router.get("/ai-insights", requireAuth, requireAdmin, aiInsights);
router.get("/ai-predictions", requireAuth, requireAdmin, aiPredictions);

module.exports = router;

module.exports = router;
