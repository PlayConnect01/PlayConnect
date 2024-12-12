const express = require('express');
const match = require("../controllers/match");

const router = express.Router();

router.get("/common-sports/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const usersWithCommonSports = await match.getUsersWithCommonSports(userId);
    res.json(usersWithCommonSports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/create", async (req, res) => {
  try {
    const { userId1, userId2, sportId } = req.body;
    const newMatch = await match.createMatch(userId1, userId2, sportId);
    res.status(201).json(newMatch);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/accept/:matchId", async (req, res) => {
  try {
    const matchId = parseInt(req.params.matchId);
    const updatedMatch = await match.acceptMatch(matchId);
    res.json(updatedMatch);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/reject/:matchId", async (req, res) => {
  try {
    const matchId = parseInt(req.params.matchId);
    const updatedMatch = await match.rejectMatch(matchId);
    res.json(updatedMatch);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;