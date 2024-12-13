const prisma = require('../prisma');
const chatController = require('./chat'); // Import the chat controller

const getUsersWithCommonSports = async (userId) => {
  try {
    console.log('User ID reçu:', userId);
    
    // Validation plus stricte de l'ID
    if (!userId || userId === 'undefined' || userId === 'null' || isNaN(userId)) {
      throw new Error('ID utilisateur invalide');
    }

    // Conversion en nombre si nécessaire
    const numericUserId = parseInt(userId, 10);

    const userSports = await prisma.userSport.findMany({
      where: { user_id: numericUserId },
      select: { sport_id: true },
    });

    if (!userSports.length) {
      return []; // Retourner un tableau vide si l'utilisateur n'a pas de sports
    }

    const sportIds = userSports.map(us => us.sport_id);

    const usersWithCommonSports = await prisma.user.findMany({
      where: {
        user_id: { not: numericUserId },
        sports: {
          some: {
            sport_id: { in: sportIds },
          },
        },
      },
      include: {
        sports: {
          include: {
            sport: true // Inclure les détails du sport
          }
        },
      },
    });

    // Transformer les données pour inclure le nom du sport
    return usersWithCommonSports.map(user => ({
      ...user,
      sports: user.sports.map(us => ({
        ...us,
        name: us.sport.name // Ajouter le nom du sport
      }))
    }));

  } catch (error) {
    console.error('Erreur dans getUsersWithCommonSports:', error);
    throw error;
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

  // Create a chat and send a welcome message after accepting the match
  try {
    await chatController.createChatWithWelcomeMessage(matchId);
  } catch (error) {
    console.error('Error creating chat after accepting match:', error);
    // Optionally, you can handle the error here (e.g., log it, notify the user, etc.)
  }

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

const getAcceptedMatches = async (userId) => {
  console.log('Fetching accepted matches for user ID:', userId);
  try {
    const numericUserId = parseInt(userId, 10);

    const matches = await prisma.match.findMany({
      where: {
        OR: [
          {
            user_id_1: numericUserId,
            status: "ACCEPTED"
          },
          {
            user_id_2: numericUserId,
            status: "ACCEPTED"
          }
        ]
      },
      include: {
        user_1: true,
        user_2: true,
        sport: true,
        chat: true // Include the chat relationship
      }
    });

    console.log('Matches found:', matches);

    return matches.map(match => ({
      ...match,
      chatId: match.chat_id, // Use the chat_id directly from the match
    }));
  } catch (error) {
    console.error('Error fetching matches:', error);
    throw error;
  }
};



const getMatchDetails = async (matchId) => {
  const match = await prisma.match.findUnique({
    where: { match_id: matchId },
    include: {
      user_1: true,
      user_2: true,
      sport: true,
    },
  });
  if (!match) {
    throw new Error('Match not found');
  }
  return match;
};



module.exports = {
  getUsersWithCommonSports,
  createMatch,
  acceptMatch,
  rejectMatch,
  getAcceptedMatches,
  getMatchDetails,
};
