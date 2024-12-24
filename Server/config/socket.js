const { Server } = require('socket.io');
const prisma = require('../prisma');
const handleMatchEvents = require('../socket/matchHandler');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', 
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`New socket connection: ${socket.id}`);

    // Initialize match events handler with socket and io instance
    handleMatchEvents(socket, io);

    socket.on('join_chat', async (data) => {
      if (!data || !data.chatId || !data.userId) {
        console.error('Invalid data for join_chat:', data);
        return;
      }

      const { chatId, userId } = data;

      try {
        const chatMember = await prisma.chatMember.findFirst({
          where: {
            chat_id: parseInt(chatId),
            user_id: parseInt(userId),
          },
        });

        if (!chatMember) {
          console.error('User is not a member of the chat');
          return;
        }

        socket.join(`chat_${chatId}`);
        console.log(`User ${userId} joined chat ${chatId}`);
      } catch (error) {
        console.error('Error verifying chat membership:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = {
  initializeSocket,
  getIO,
};