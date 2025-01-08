const express = require('express');
const router = express.Router();
const { getAllSports, getUserSports, addUserSport, removeUserSport } = require('../controllers/userSport');

// Get all available sports
router.get('/sports', getAllSports);

// Get user's sports
router.get('/:userId', getUserSports);

// Add a sport to user's interests
router.post('/add', addUserSport);

// Remove a sport from user's interests
router.delete('/:userId/:sportId', removeUserSport);

module.exports = router;