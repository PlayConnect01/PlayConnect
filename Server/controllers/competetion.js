const prisma = require('../prisma'); // Assuming you are using Prisma for database interaction

// Get all tournaments
const getAllTournamentsAndTeams = async (req, res) => {
  try {
    const tournaments = await prisma.tournament.findMany({
      include: {
        sport: true,
        creator: {
          select: { username: true }
        },
        teams: {
          include: {
            team: {
              include: {
                members: true
              }
            }
          }
        }
      }
    });
    res.status(200).json(tournaments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllTournaments = async (req, res) => {
  try {
    const tournaments = await prisma.tournament.findMany();
    res.status(200).json(tournaments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a tournament by ID
const getTournamentById = async (req, res) => {
  const { id } = req.params;
  try {
    const tournament = await prisma.tournament.findUnique({
      where: { tournament_id: parseInt(id) },
      include: {
        sport: true,
        creator: {
          select: {
            username: true
          }
        },
        teams: {
          include: {
            team: {
              include: {
                members: {
                  include: {
                    user: {
                      select: {
                        user_id: true,
                        username: true
                      }
                    }
                  }
                },
                creator: {
                  select: {
                    username: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    // Transform data structure to match frontend expectations
    const transformedTournament = {
      ...tournament,
      teams: tournament.teams.map(tt => ({
        team_id: tt.team.team_id,
        team_name: tt.team.team_name,
        members: tt.team.members,
        creator: tt.team.creator
      }))
    };

    res.status(200).json(transformedTournament);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new tournament
const createTournament = async (req, res) => {
  const { tournament_name, sport_id, created_by, start_date, end_date, point_reward } = req.body;
  try {
    const newTournament = await prisma.tournament.create({
      data: {
        tournament_name,
        sport_id,
        created_by,
        start_date,
        end_date,
        point_reward
      }
    });
    res.status(201).json(newTournament);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a tournament
const updateTournament = async (req, res) => {
  const { id } = req.params;
  const { tournament_name, sport_id, created_by, start_date, end_date, point_reward } = req.body;
  try {
    const updatedTournament = await prisma.tournament.update({
      where: { tournament_id: parseInt(id) },
      data: {
        tournament_name,
        sport_id,
        created_by,
        start_date,
        end_date,
        point_reward
      }
    });
    res.status(200).json(updatedTournament);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a tournament
const deleteTournament = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.tournament.delete({
      where: { tournament_id: parseInt(id) }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add this new function
const getTotalTournaments = async (req, res) => {
  try {
    const count = await prisma.tournament.count();
    res.json({ total: count });
  } catch (error) {
    res.status(500).json({ error: "Error fetching tournament count" });
  }
};

module.exports = {
  getAllTournaments,
  getTournamentById,
  createTournament,
  updateTournament,
  deleteTournament,
  getAllTournamentsAndTeams,
  getTotalTournaments
};
