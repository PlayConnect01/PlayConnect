const prisma = require("../prisma");
const { getIO } = require("../config/socket");

async function createChatWithWelcomeMessage(matchId) {
  try {
    const match = await prisma.match.findUnique({
      where: { match_id: matchId },
      include: { user_1: true, user_2: true },
    });

    if (!match || match.status !== "ACCEPTED") {
      throw new Error("Match not found or not accepted.");
    }

    const chat = await prisma.$transaction(async (prisma) => {
      const newChat = await prisma.chat.create({
        data: {
          is_group: false,
          chat_members: {
            createMany: {
              data: [
                { user_id: match.user_id_1 },
                { user_id: match.user_id_2 }
              ],
            },
          },
        },
      });

      await prisma.match.update({
        where: { match_id: matchId },
        data: { chat_id: newChat.chat_id },         // Update statuts match and taking the id chat 

      });

      return newChat;
    });

    await prisma.message.create({
      data: {
        chat_id: chat.chat_id,
        content: `Match ID: ${matchId}`,
        message_type: "SYSTEM",
      },
    });

    return chat;
  } catch (error) {
    console.error("Error creating chat:", error);
    throw error;
  }
}

//  message history

async function getChatMessages(chatId) {
  try {
    const messages = await prisma.message.findMany({
      where: {
        chat_id: parseInt(chatId),
      },
      include: {
        sender: true,
      },
      orderBy: {
        sent_at: "asc",
      },
    });
    return messages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
}

// Verify if user is in chat

async function verifyUserInChat(userId, chatId) {
  try {
    const chatMember = await prisma.chatMember.findFirst({
      where: {
        chat_id: parseInt(chatId),
        user_id: parseInt(userId),
      },
    });
    return !!chatMember;
  } catch (error) {
    console.error("Error verifying user in chat:", error);
    throw error;
  }
}

// Send a message
async function sendMessage(chatId, senderId, content, messageType = "TEXT") {
  try {
    const isUserInChat = await verifyUserInChat(senderId, chatId);
    if (!isUserInChat) {
      throw new Error("User not authorized to send messages in this chat");
    }

    const newMessage = await prisma.message.create({
      data: {
        chat_id: parseInt(chatId),
        sender_id: parseInt(senderId),
        content: content,
        message_type: messageType,
        sent_at: new Date()
      },
      include: {
        sender: {
          select: {
            username: true,
            profile_picture: true
          }
        }
      },
    });

    const formattedMessage = {
      ...newMessage,
      sent_at: newMessage.sent_at.toISOString()
    };

    const io = getIO();
    io.to(`chat_${chatId}`).emit("receive_message", formattedMessage);

    return formattedMessage;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}
///////// handle message voc /////////////
async function handleAudioMessage(chatId, senderId, fileUrl) {
    try {
        console.log('Creating audio message for chat:', chatId);
        console.log('Sender ID:', senderId);
        console.log('File URL:', fileUrl);

        // Create the audio message
        const audioMessage = await prisma.message.create({
            data: {
                chat_id: parseInt(chatId),
                sender_id: parseInt(senderId),
                content: fileUrl,  // Store the URL in content
                message_type: "AUDIO",
                voice_file_url: fileUrl,
                sent_at: new Date(),
            },
            include: {
                sender: true,
            },
        });

        // Get socket instance
        const io = getIO();
        
        // Emit the message to all users in the chat
        if (io) {
            console.log('Broadcasting audio message to chat:', chatId);
            io.to(`chat_${chatId}`).emit('receive_message', {
                ...audioMessage,
                voice_file_url: fileUrl  // Ensure voice_file_url is included
            });
        }

        return {
            ...audioMessage,
            voice_file_url: fileUrl  // Include voice_file_url in the response
        };
    } catch (error) {
        console.error('Error handling audio message:', error);
        throw error;
    }
}

module.exports = {
    createChatWithWelcomeMessage,
    getChatMessages,
    verifyUserInChat,
    sendMessage,
    handleAudioMessage,
};