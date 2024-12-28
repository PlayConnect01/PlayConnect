const prisma = require('../prisma');
const chatController = require('./chat'); 

const getUsersWithCommonSports = async (userId) => {
  try {
    console.log('User ID reçu:', userId);
    
    if (!userId || userId === 'undefined' || userId === 'null' || isNaN(userId)) {
      throw new Error('ID utilisateur invalide');
    }

    const numericUserId = parseInt(userId, 10);

    // Get existing accepted matches for the user
    const existingMatches = await prisma.match.findMany({
      where: {
        OR: [
          { user_id_1: numericUserId },
          { user_id_2: numericUserId }
        ],
        status: 'ACCEPTED'
      },
      select: {
        user_id_1: true,
        user_id_2: true
      }
    });

    // Get all user IDs that the current user has already matched with
    const matchedUserIds = existingMatches.reduce((acc, match) => {
      if (match.user_id_1 === numericUserId) {
        acc.push(match.user_id_2);
      } else {
        acc.push(match.user_id_1);
      }
      return acc;
    }, []);

    const userSports = await prisma.userSport.findMany({
      where: { user_id: numericUserId },
      select: { sport_id: true },
    });

    if (!userSports.length) {
      return []; 
    }

    const sportIds = userSports.map(us => us.sport_id);

    const usersWithCommonSports = await prisma.user.findMany({
      where: {
        user_id: { 
          not: numericUserId,
          notIn: matchedUserIds // Exclude users who already have an accepted match
        },
        sports: {
          some: {
            sport_id: { in: sportIds },
          },
        },
      },
      include: {
        sports: {
          include: {
            sport: true 
          }
        },
      },
    });

    return usersWithCommonSports.map(user => ({
      ...user,
      sports: user.sports.map(us => ({
        ...us,
        name: us.sport.name
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
    include: {
      user_1: true,
      user_2: true,
      sport: true,
    },
  });

  // Create notification for user_2
  const notification = await prisma.notification.create({
    data: {
      user_id: userId2,
      type: 'MATCH_REQUEST',
      title: 'New Match Request',
      content: `${match.user_1.username} wants to match with you for ${match.sport.name}!`,
      match_id: match.match_id,
    },
  });

  // Get Socket.IO instance and emit notification
  const { getIO } = require('../config/socket');
  const io = getIO();
  io.to(`user_${userId2}`).emit('match_request', {
    match,
    notification,
  });

  return match;
};

const updateMatchStatus = async (matchId, status) => {
  try {
    const updatedMatch = await prisma.match.update({
      where: {
        match_id: parseInt(matchId),
      },
      data: {
        status: status,
        ...(status === 'ACCEPTED' ? { accepted_at: new Date() } : {}),
        ...(status === 'REJECTED' ? { rejected_at: new Date() } : {}),
      },
    });
    return updatedMatch;
  } catch (error) {
    console.error('Error updating match status:', error);
    throw error;
  }
};

const acceptMatch = async (matchId) => {
  const updatedMatch = await updateMatchStatus(matchId, 'ACCEPTED');

  // Create a chat and send a welcome message after accepting the match
  try {
    await chatController.createChatWithWelcomeMessage(matchId);
  } catch (error) {
    console.error('Error creating chat after accepting match:', error);
  }

  return updatedMatch;
};

const rejectMatch = async (matchId) => {
  const updatedMatch = await updateMatchStatus(matchId, 'REJECTED');
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
        chat: true 
      }
    });

    console.log('Matches found:', matches);

    return matches.map(match => ({
      ...match,
      chatId: match.chat_id, // take the match id directly 
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
  updateMatchStatus,
  acceptMatch,
  rejectMatch,
  getAcceptedMatches,
  getMatchDetails,
};