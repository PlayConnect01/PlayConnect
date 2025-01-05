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
                    user: true
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
    res.status(200).json(tournament);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new tournament
const createTournament = async (req, res) => {
  const { tournament_name, sport_id, created_by, start_date, end_date, point_reward } = req.body;
  try {
    // First verify that the admin exists
    const adminExists = await prisma.admin.findUnique({
      where: { admin_id: parseInt(created_by) }
    });

    if (!adminExists) {
      console.log("Admin not found for ID:", created_by);
      return res.status(404).json({ 
        error: "Admin not found",
        message: "The admin ID provided does not exist in the database."
      });
    }

    // Convert string datetime to proper Date objects
    const startDateTime = new Date(start_date);
    const endDateTime = new Date(end_date);

    const newTournament = await prisma.tournament.create({
      data: {
        tournament_name,
        sport_id: parseInt(sport_id),
        created_by: parseInt(created_by),
        start_date: startDateTime,
        end_date: endDateTime,
        point_reward: parseInt(point_reward)
      },
      include: {
        sport: true,
        creator: {
          select: { 
            admin_id: true,
            username: true 
          }
        }
      }
    });

    res.status(201).json(newTournament);
  } catch (error) {
    console.error('Tournament creation error:', error);
    res.status(400).json({ 
      error: "Error creating tournament",
      message: error.message,
      details: "Make sure the admin ID exists in the database"
    });
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

// Add this new function
const getTodayTournaments = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tournaments = await prisma.tournament.findMany({
      where: {
        start_date: {
          gte: today,
          lt: tomorrow,
        }
      },
      include: {
        sport: {
          select: {
            name: true,
            icon: true
          }
        },
        creator: {
          select: { 
            username: true,
            admin_id: true
          }
        },
        teams: {
          include: {
            team: true
          }
        }
      },
      orderBy: {
        start_date: 'asc'
      }
    });

    // Format the tournaments with proper time labels
    const tournamentsWithLabel = tournaments.map(tournament => {
      const tournamentDate = new Date(tournament.start_date);
      const currentTime = new Date();
      
      let timeLabel = "Today";
      if (tournamentDate < currentTime) {
        timeLabel = "Ongoing";
      }

      return {
        ...tournament,
        timeLabel,
        formattedStartTime: tournamentDate.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        formattedEndTime: new Date(tournament.end_date).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      };
    });

    res.json(tournamentsWithLabel);
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    res.status(500).json({ error: "Error fetching tournaments", details: error.message });
  }
};

module.exports = {
  getAllTournaments,
  getTournamentById,
  createTournament,
  updateTournament,
  deleteTournament,
  getAllTournamentsAndTeams,
  getTotalTournaments,
  createTournament,
  getTodayTournaments
};
