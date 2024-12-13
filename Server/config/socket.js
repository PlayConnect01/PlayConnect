const { Server } = require('socket.io');
const prisma = require('../prisma');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // Adjust according to your production needs
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Nouvelle connexion socket:', socket.id);

    // Rejoindre un chat spécifique
    socket.on('join_chat', async (data) => {
      // Check if data is valid
      if (!data || !data.chatId || !data.userId) {
        console.error('Received invalid data for join_chat:', data);
        return; // Exit if data is null or missing properties
      }

      const { chatId, userId } = data; // Destructure after validation

      try {
        // Verify if user is in chat
        const chatMember = await prisma.chatMember.findFirst({
          where: {
            chat_id: parseInt(chatId),
            user_id: parseInt(userId)
          }
        });

        if (!chatMember) {
          console.error('User is not a member of the chat');
          return; // Exit if user is not a member
        }

        // Proceed with joining the chat
        socket.join(`chat_${chatId}`);
        console.log(`User ${userId} joined chat ${chatId}`);
      } catch (error) {
        console.error('Error verifying user in chat:', error);
      }
    });

    // Gestion des messages
    socket.on('send_message', async (data) => {
      // Check if data is valid
      if (!data || !data.chatId || !data.senderId || !data.content) {
        console.error('Received invalid data for send_message:', data);
        return; // Exit if data is null or missing properties
      }

      const { chatId, senderId, content } = data; // Destructure after validation

      try {
        // Create the message in the database
        const newMessage = await prisma.message.create({
          data: {
            chat_id: parseInt(chatId),
            sender_id: parseInt(senderId),
            content: content,
            message_type: 'text'
          }
        });

        // Send the message to all members of the chat
        io.to(`chat_${chatId}`).emit('receive_message', newMessage);
      } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
      }
    });

    // Déconnexion
    socket.on('disconnect', () => {
      console.log('Socket déconnecté:', socket.id);
    });
  });

  return io;
};

// Fonction pour obtenir l'instance io
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = {
  initializeSocket,
  getIO
}; 