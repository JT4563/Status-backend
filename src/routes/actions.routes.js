const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const { createAction } = require("../controllers/actions.controller");

router.post("/", requireAuth, createAction);

module.exports = router;
