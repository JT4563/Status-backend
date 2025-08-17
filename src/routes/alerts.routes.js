const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const {
  listAlerts,
  resolveAlert,
} = require("../controllers/alerts.controller");

router.get("/", requireAuth, listAlerts);
router.patch("/:id/resolve", requireAuth, resolveAlert);

module.exports = router;
