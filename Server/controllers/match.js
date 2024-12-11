const prisma = require('../prisma');
const  { getUserSports } =require("./user") ;

const findMatches = async (userId) => {

    const userIdInt = parseInt(userId, 10);
  
    const userSports = await getUserSports(userIdInt);
    const sportIds = userSports.map(userSport => userSport.sport_id);
  
    const potentialMatches = await prisma.userSport.findMany({
      where: {
        sport_id: {
          in: sportIds,
        },
        user_id: {
          not: userIdInt, 
        },
      },
      include: {
        user: true,
      },
    });
  
    const matchedUsers = potentialMatches.map(userSport => userSport.user);
    return [...new Set(matchedUsers)];
  };

// Fonction pour accepter un match
 const acceptMatch = async (req, res) => {
  const { matchId } = req.params;

  try {
    // Logique pour mettre à jour le statut du match à "ACCEPTED"
    await prisma.match.update({
      where: { match_id: parseInt(matchId, 10) },
      data: { status: 'ACCEPTED' },
    });

    // Appeler la fonction pour gérer le match accepté
    await handleMatchAccepted(matchId);

    res.status(200).json({ message: 'Match accepted and chat created successfully.' });
  } catch (error) {
    console.error("Error accepting match:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {findMatches,acceptMatch}
