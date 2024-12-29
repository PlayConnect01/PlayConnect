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

    socket.on('joinChat', async (chatId) => {
      if (!chatId) {
        console.error('Invalid chatId for joinChat:', chatId);
        return;
      }

      socket.join(`chat_${chatId}`);
      console.log(`Socket ${socket.id} joined chat ${chatId}`);
    });

    // Gestion des messages en temps réel
    socket.on('newMessage', async (messageData) => {
      console.log('New message received on server:', messageData);
      const { chatId, senderId } = messageData;
      
      // Émettre le message uniquement aux autres membres du chat
      socket.to(`chat_${chatId}`).emit('receiveMessage', messageData);
      
      // Émettre une notification globale pour le Navbar
      socket.broadcast.emit('newNotification', {
        chatId,
        senderId,
        timestamp: new Date()
      });
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