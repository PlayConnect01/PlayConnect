const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getLeaderboard = async (req, res) => {
  try {
    // Get all users with their created events count
    const users = await prisma.user.findMany({
      select: {
        user_id: true,
        username: true,
        profile_picture: true,
        points: true,
        created_events: {
          select: {
            event_id: true,
          },
        },
      },
    });

    // Calculate points and create leaderboard entries
    const leaderboard = users.map(user => ({
      id: user.user_id,
      username: user.username,
      profile_picture: user.profile_picture,
      points: user.points,
      events_created: user.created_events.length
    }));

    // Sort by points in descending order
    leaderboard.sort((a, b) => b.points - a.points);

    // Add rank to each user
    const rankedLeaderboard = leaderboard.map((user, index) => ({
      ...user,
      rank: index + 1
    }));

    res.json(rankedLeaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Error fetching leaderboard" });
  }
};

module.exports = {
  getLeaderboard
};