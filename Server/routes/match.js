const express = require('express');
const router = express.Router();
const matchController = require('../controllers/match');

// Route pour trouver des matches potentiels
router.get('/potential/:userId', async (req, res) => {
    try {
        const matches = await matchController.findMatches(req.params.userId);
        res.json(matches);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route pour créer une demande de match
router.post('/create', matchController.createMatch);

// Route pour accepter un match
router.put('/:matchId/accept', matchController.acceptMatch);

// Route pour rejeter un match
router.put('/:matchId/reject', matchController.rejectMatch);

// Route pour obtenir tous les matches d'un utilisateur
router.get('/user/:userId', matchController.getUserMatches);

// Route pour obtenir les matches en attente d'un utilisateur
router.get('/pending/:userId', matchController.getPendingMatches);

module.exports = router;
