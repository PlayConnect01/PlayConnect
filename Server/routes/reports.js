const express = require('express');
const { createReport, getReports } = require('../controllers/reports');
const router = express.Router();

router.post('/', createReport);
router.get('/', getReports);

module.exports = router;