const express = require('express');
const { getLeaderboard } = require('../controllers/leaderboard.js');

const router = express.Router();

// Leaderboard route
router.get('/', getLeaderboard);

module.exports = router; 