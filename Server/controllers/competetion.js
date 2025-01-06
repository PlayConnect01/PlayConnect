const prisma = require('../prisma'); // Assuming you are using Prisma for database interaction
const QRCode = require('qrcode'); // Assuming you are using qrcode library for QR code generation

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

// Create a team for a tournament
const createTournamentTeam = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { teamName, userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Get tournament details to verify it exists and get sport_id
    const tournament = await prisma.tournament.findUnique({
      where: { tournament_id: parseInt(tournamentId) },
      include: { sport: true }
    });

    if (!tournament) {
      return res.status(404).json({ error: "Tournament not found" });
    }

    // Create the team
    const team = await prisma.team.create({
      data: {
        team_name: teamName,
        sport_id: tournament.sport_id,
        created_by: userId,
      },
    });

    // Add creator as team member (captain)
    await prisma.teamMember.create({
      data: {
        team_id: team.team_id,
        user_id: userId,
        role: "CAPTAIN",
      },
    });

    // Link team to tournament
    const tournamentTeam = await prisma.tournamentTeam.create({
      data: {
        tournament_id: parseInt(tournamentId),
        team_id: team.team_id,
      },
      include: {
        team: {
          include: {
            members: {
              include: {
                user: true
              }
            },
            creator: true
          }
        }
      }
    });

    res.json({
      success: true,
      team: {
        ...tournamentTeam.team,
        tournament_team_id: tournamentTeam.tournament_team_id
      }
    });
  } catch (error) {
    console.error("Error creating tournament team:", error);
    res.status(500).json({ error: "Failed to create team" });
  }
};

// Add member to team with QR code
const addTeamMemberWithQR = async (req, res) => {
  const { teamId } = req.params;
  const { userId } = req.body;

  if (!teamId || !userId) {
    return res.status(400).json({ error: "Team ID and User ID are required" });
  }

  try {
    // Check if the user is already a member of the team
    const existingMembership = await prisma.teamMember.findFirst({
      where: {
        user_id: parseInt(userId),
        team_id: parseInt(teamId)
      }
    });

    if (existingMembership) {
      return res.status(400).json({ error: "User is already a member of this team" });
    }

    // Add the user as a team member
    const teamMember = await prisma.teamMember.create({
      data: {
        team_id: parseInt(teamId),
        user_id: parseInt(userId),
        role: "MEMBER" // Default role for new members
      }
    });

    // Generate QR code for the team member
    const qrData = {
      teamId: teamId,
      userId: userId,
      memberId: teamMember.team_member_id
    };
    
    const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));

    res.json({ 
      success: true, 
      teamMember,
      qrCode 
    });
  } catch (error) {
    console.error("Error adding team member:", error);
    res.status(500).json({ error: "Failed to add team member" });
  }
};

// Get team details with members
const getTeamDetails = async (req, res) => {
  const { teamId } = req.params;

  try {
    const team = await prisma.team.findUnique({
      where: {
        team_id: parseInt(teamId)
      },
      include: {
        sport: true,
        creator: {
          select: {
            user_id: true,
            username: true,
            email: true,
            profile_picture: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                user_id: true,
                username: true,
                profile_picture: true
              }
            }
          }
        }
      }
    });

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    res.json(team);
  } catch (error) {
    console.error("Error fetching team details:", error);
    res.status(500).json({ error: "Failed to fetch team details" });
  }
};

// Remove member from team
const removeTeamMember = async (req, res) => {
  const { teamId, userId } = req.params;

  try {
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        team_id: parseInt(teamId),
        user_id: parseInt(userId)
      }
    });

    if (!teamMember) {
      return res.status(404).json({ error: "Team member not found" });
    }

    await prisma.teamMember.delete({
      where: {
        team_member_id: teamMember.team_member_id
      }
    });

    res.json({ success: true, message: "Team member removed successfully" });
  } catch (error) {
    console.error("Error removing team member:", error);
    res.status(500).json({ error: "Failed to remove team member" });
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
  createTournamentTeam,
  addTeamMemberWithQR,
  getTeamDetails,
  removeTeamMember
};
