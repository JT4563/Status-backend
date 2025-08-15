const router = require('express').Router();
const { createReport, listReports } = require('../controllers/reports.controller');

// public submission allowed
router.post('/', createReport);
// staff can list (if you want to protect, add auth middleware)
router.get('/', listReports);

module.exports = router;
