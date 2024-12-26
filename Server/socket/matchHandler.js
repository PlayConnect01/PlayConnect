const prisma = require('../prisma');

const handleMatchEvents = (socket, io) => {
  // Join user to their personal room for notifications
  socket.on('join_user_room', (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined their notification room`);
    }
  });

  // Handle match response notification
  socket.on('match_response', async ({ matchId, userId, response, match }) => {
    try {
      if (match) {
        // Notify both users about the match update
        io.to(`user_${match.user_id_1}`).emit('match_update', {
          type: response === 'accept' ? 'ACCEPTED' : 'REJECTED',
          match,
        });
        io.to(`user_${match.user_id_2}`).emit('match_update', {
          type: response === 'accept' ? 'ACCEPTED' : 'REJECTED',
          match,
        });

        console.log(`Match ${matchId} update notification sent to users`);
      }
    } catch (error) {
      console.error('Error sending match update notification:', error);
      socket.emit('error', { message: 'Failed to send match update notification' });
    }
  });
};

module.exports = handleMatchEvents;
