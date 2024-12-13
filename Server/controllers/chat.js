const prisma = require('../prisma');
const { getIO } = require('../config/socket');

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

    if (!match || match.status !== 'ACCEPTED') {
      throw new Error("Match not found or not accepted.");
    }

    // Créer un chat et un message de bienvenue dans une seule transaction
    const chatWithMessage = await prisma.$transaction(async (tx) => {
      // Créer le chat
      const chat = await tx.chat.create({
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

      // Créer le message de bienvenue lié au chat
      const welcomeMessage = await tx.message.create({
        data: {
          chat_id: chat.chat_id,
          sender_id: null,
          content: "You can now start your discussion!",
          message_type: 'SYSTEM',
        },
      });

      return { chat, welcomeMessage };
    });

    return chatWithMessage.chat;
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
}

module.exports = {
  createChatWithWelcomeMessage,
};

// Get chat message history
async function getChatMessages(chatId) {
  try {
    const messages = await prisma.message.findMany({
      where: {
        chat_id: parseInt(chatId)
      },
      include: {
        sender: true 
      },
      orderBy: {
        sent_at: 'asc'
      }
    });
    return messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
}

// Verify if user is in chat
async function verifyUserInChat(userId, chatId) {
  try {
    const chatMember = await prisma.chatMember.findFirst({
      where: {
        chat_id: parseInt(chatId),
        user_id: parseInt(userId)
      }
    });
    return !!chatMember;
  } catch (error) {
    console.error('Error verifying user in chat:', error);
    throw error;
  }
}

// Send a message
async function sendMessage(chatId, senderId, content, messageType = 'TEXT') {
  try {
    // Verify if user is in chat
    const isUserInChat = await verifyUserInChat(senderId, chatId);
    if (!isUserInChat) {
      throw new Error('User not authorized to send messages in this chat');
    }

    // Create the message
    const newMessage = await prisma.message.create({
      data: {
        chat_id: parseInt(chatId),
        sender_id: parseInt(senderId),
        content: content,
        message_type: messageType
      },
      include: {
        sender: true
      }
    });

    // Emit message via socket
    const io = getIO();
    io.to(`chat_${chatId}`).emit('receive_message', newMessage);

    return newMessage;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

module.exports = {
  createChatWithWelcomeMessage,
  getChatMessages,
  verifyUserInChat,
  sendMessage
};