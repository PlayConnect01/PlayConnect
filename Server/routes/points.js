const express = require('express');
const { logPoints, getUserPoints } = require('../controllers/points.js');

const router = express.Router();

// Points routes
router.post('/log', logPoints);
router.get('/userPoints', getUserPoints);

module.exports = router; 