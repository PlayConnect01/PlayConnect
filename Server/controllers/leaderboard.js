const { PrismaClient } = require('@prisma/client');
const prismaClient = new PrismaClient();

const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await prismaClient.user.findMany({
      select: {
        user_id: true,
        username: true,
        points: true,
      },
      orderBy: {
        points: 'desc', // Order by points in descending order
      },
      take: 100, // Limit to top 10 users
    });

    res.status(200).json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Error fetching leaderboard' });
  }
};

module.exports = { getLeaderboard }; 