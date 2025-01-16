const express = require('express');
const { createReport, getReports, updateReportStatus } = require('../controllers/reports');
const router = express.Router();

router.post('/', createReport);
router.get('/', getReports);
router.put('/:reportId', updateReportStatus);

module.exports = router;