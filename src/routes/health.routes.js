const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/requireRole");
const {
  healthCheck,
  getSystemMetrics,
} = require("../controllers/health.controller");

// Public health endpoint for basic status
router.get("/", healthCheck);

// Admin-only detailed system metrics
router.get("/metrics", requireAuth, requireAdmin, getSystemMetrics);

module.exports = router;

module.exports = router;
