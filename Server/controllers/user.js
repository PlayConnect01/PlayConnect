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

  module.exports = {getAllUsers}
