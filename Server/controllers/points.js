const { PrismaClient } = require('@prisma/client');
const prismaClient = new PrismaClient();

const logPoints = async (req, res) => {
  const { userId, activity, points } = req.body;

  try {
    // Log points in PointsLog
    await prismaClient.pointsLog.create({
      data: {
        user_id: userId,
        activity,
        points,
      },
    });

    // Update user's total points
    await prismaClient.user.update({
      where: { user_id: userId },
      data: {
        points: { increment: points },
      },
    });

    res.status(200).json({ message: 'Points logged successfully' });
  } catch (error) {
    console.error('Error logging points:', error);
    res.status(500).json({ error: 'Error logging points' });
  }
};

const getUserPoints = async (req, res) => {
  const userId = req.user.id; // Assuming you have user ID from the token

  try {
    const user = await prismaClient.user.findUnique({
      where: { user_id: userId },
      select: { points: true },
    });

    res.status(200).json({ points: user.points });
  } catch (error) {
    console.error('Error fetching user points:', error);
    res.status(500).json({ error: 'Error fetching user points' });
  }
};

module.exports = { logPoints, getUserPoints }; 