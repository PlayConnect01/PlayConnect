const express = require('express');
const {
  getAllTournaments,
  getTournamentById,
  createTournament,
  updateTournament,
  deleteTournament,
  getAllTournamentsAndTeams
} = require('../controllers/competetion');

const router = express.Router();

// Get all tournaments
router.get('/', getAllTournaments); 

router.get('/Teams', getAllTournamentsAndTeams); 

// Get a tournament by ID
router.get('/:id', getTournamentById); 

// Create a new tournament
router.post('/', createTournament); 

// Update a tournament
router.put('/:id', updateTournament); 

// Delete a tournament
router.delete('/:id', deleteTournament); 

module.exports = router;
