const prisma = require('../prisma');
const { getIO } = require('../config/socket');

// Création d'un chat avec message de bienvenue
async function createChatWithWelcomeMessage(matchId) {
  try {
    // Récupérer les détails du match
    const match = await prisma.match.findUnique({
      where: { match_id: matchId },
      include: {
        user_1: true,
        user_2: true,
      },
    });

    if (!match || match.status !== 'accepted') {
      throw new Error("Match not found or not accepted.");
    }

    // Créer un chat
    const chat = await prisma.chat.create({
      data: {
        is_group: false,
        chat_members: {
          create: [
            { user_id: match.user_id_1 },
            { user_id: match.user_id_2 },
          ],
        },
      },
    });

    // Créer le message de bienvenue
    await prisma.message.create({
      data: {
        chat_id: chat.chat_id,
        sender_id: null, 
        content: "You can now start your discussion!",
        message_type: "text", 
      },
    });

    return chat;
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
}

// Récupérer l'historique des messages
async function getChatMessages(chatId) {
  try {
    const messages = await prisma.message.findMany({
      where: {
        chat_id: chatId
      },
      include: {
        sender: true // Inclure les informations de l'expéditeur
      },
      orderBy: {
        timestamp: 'asc'
      }
    });
    return messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
}

// Vérifier si un utilisateur fait partie du chat
async function verifyUserInChat(userId, chatId) {
  try {
    const chatMember = await prisma.chat_members.findFirst({
      where: {
        chat_id: chatId,
        user_id: userId
      }
    });
    return !!chatMember;
  } catch (error) {
    console.error('Error verifying user in chat:', error);
    throw error;
  }
}

// Envoyer un message
async function sendMessage(chatId, senderId, content) {
  try {
    // Vérifier si l'utilisateur fait partie du chat
    const isUserInChat = await verifyUserInChat(senderId, chatId);
    if (!isUserInChat) {
      throw new Error('User not authorized to send messages in this chat');
    }

    // Créer le message
    const newMessage = await prisma.message.create({
      data: {
        chat_id: chatId,
        sender_id: senderId,
        content: content,
        message_type: 'text'
      },
      include: {
        sender: true
      }
    });

    // Utiliser getIO() pour émettre des événements
    const io = getIO();
    io.to(chatId).emit('receive_message', newMessage);

    return newMessage;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

// Routes HTTP pour le chat
const getChatHistory = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await getChatMessages(chatId);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const sendNewMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { senderId, content } = req.body;
    const message = await sendMessage(chatId, senderId, content);
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createChatWithWelcomeMessage,
  getChatHistory,
  sendNewMessage,
  verifyUserInChat,
  sendMessage
};
  