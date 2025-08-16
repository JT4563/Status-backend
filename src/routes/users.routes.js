const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/requireRole");
const {
  createUser,
  listUsers,
  updateUser,
  deleteUser,
  getUserById,
} = require("../controllers/users.controller");

// All user management routes require admin access
router.post("/", requireAuth, requireAdmin, createUser);
router.get("/", requireAuth, requireAdmin, listUsers);
router.get("/:id", requireAuth, requireAdmin, getUserById);
router.put("/:id", requireAuth, requireAdmin, updateUser);
router.delete("/:id", requireAuth, requireAdmin, deleteUser);

module.exports = router;
