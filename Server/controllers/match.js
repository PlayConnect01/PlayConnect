const prisma = require('../prisma');


const getUsersWithCommonSports = async (userId) => {
  try {
    // Récupérer les sports de l'utilisateur donné
    const userSports = await prisma.userSport.findMany({
      where: { user_id: userId },
      select: { sport_id: true },
    });

    // Extraire les IDs des sports
    const sportIds = userSports.map(us => us.sport_id);

    // Récupérer les utilisateurs qui partagent ces sports
    const usersWithCommonSports = await prisma.user.findMany({
      where: {
        user_id: { not: userId }, // Exclure l'utilisateur lui-même
        sports: {
          some: {
            sport_id: { in: sportIds }, // Filtrer par sports communs
          },
        },
      },
      include: {
        sports: true, // Inclure les sports pour chaque utilisateur
      },
    });

    return usersWithCommonSports;
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    throw error; // Propager l'erreur pour un traitement ultérieur
  }
};



  const createMatch = async (userId1, userId2, sportId) => {
    const match = await prisma.match.create({
      data: {
        user_id_1: userId1,
        user_id_2: userId2,
        sport_id: sportId,
        status: 'PENDING',
      },
    });
    return match;
  };


  const acceptMatch = async (matchId) => {
    const updatedMatch = await prisma.match.update({
      where: { match_id: matchId },
      data: {
        status: 'ACCEPTED',
        accepted_at: new Date(),
      },
    });
    return updatedMatch;
  };

  const rejectMatch = async (matchId) => {
    const updatedMatch = await prisma.match.update({
      where: { match_id: matchId },
      data: {
        status: 'REJECTED',
        rejected_at: new Date(),
      },
    });
    return updatedMatch;
  };
  

    
module.exports = {
    getUsersWithCommonSports,
    createMatch,
    acceptMatch,
    rejectMatch
};
