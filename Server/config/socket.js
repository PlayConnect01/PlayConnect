const { Server } = require('socket.io');
const prisma = require("../prisma");

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // Ajustez selon vos besoins en production
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Nouvelle connexion socket:', socket.id);

    // Rejoindre un chat spécifique
    socket.on('join_chat', async ({ chatId, userId }) => {
      try {
        // Vérifier si l'utilisateur fait partie du match
        const chatMember = await prisma.chat_members.findFirst({
          where: {
            chat_id: chatId,
            user_id: userId
          }
        });

        if (chatMember) {
          socket.join(chatId);
          console.log(`User ${userId} a rejoint le chat ${chatId}`);
        }
      } catch (error) {
        console.error('Erreur lors de la connexion au chat:', error);
      }
    });

    // Gestion des messages
    socket.on('send_message', async ({ chatId, senderId, content }) => {
      try {
        // Créer le message dans la base de données
        const newMessage = await prisma.message.create({
          data: {
            chat_id: chatId,
            sender_id: senderId,
            content: content,
            message_type: 'text'
          }
        });

        // Envoyer le message à tous les membres du chat
        io.to(chatId).emit('receive_message', newMessage);
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