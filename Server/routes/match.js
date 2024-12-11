const express = require('express');
const { findMatches } = require('../controllers/match');

const router = express.Router();

router.get('/:userId/matches', async (req, res) => {
  const { userId } = req.params;

  try {
    const matches = await findMatches(userId);
    res.json(matches);
  } catch (error) {
    console.error("Error finding matches:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
