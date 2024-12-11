const prisma = require('../prisma');

 const getAllUsers = async (req, res) => {
    try {
      const users = await prisma.user.findMany();
      res.json(users);
    } catch (error) {
      console.error("Error retrieving users:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };


   const getUserSports = async (userId) => {
    return await prisma.userSport.findMany({
      where: { user_id: userId },
      include: { sport: true }, 
    });
  };

  module.exports = {getAllUsers,getUserSports}























