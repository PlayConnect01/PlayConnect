const express = require('express');
const {
  getAllTournaments,
  getTournamentById,
  createTournament,
  updateTournament,
  deleteTournament,
  getAllTournamentsAndTeams,
  getTotalTournaments,
  createTournamentTeam,
  addTeamMemberWithQR,
  getTeamDetails,
  removeTeamMember,
  getTodayTournaments
} = require('../controllers/competetion');

const router = express.Router();

// Get all tournaments
router.get('/', getAllTournaments); 

router.get('/Teams', getAllTournamentsAndTeams); 

// Get total tournaments count
router.get("/count/total", getTotalTournaments);

// Team routes
router.post('/:tournamentId/teams', createTournamentTeam);
router.get('/teams/:teamId', getTeamDetails);
router.post('/teams/:teamId/join', addTeamMemberWithQR);
router.delete('/teams/:teamId/members/:userId', removeTeamMember);

// Get a tournament by ID
router.get('/:id', getTournamentById); 

// Create a new tournament
router.post('/create', createTournament); 

// Update a tournament
router.put('/:id', updateTournament); 

// Delete a tournament
router.delete('/:id', deleteTournament); 

// Add this new route before the /:id route
router.get("/count/total", getTotalTournaments);

router.get('/today', getTodayTournaments);

module.exports = router;
