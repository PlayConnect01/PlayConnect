const { Server } = require('socket.io');
const prisma = require('../prisma');

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

    socket.on('send_message', async (data) => {
      if (!data || !data.chatId || !data.senderId || !data.message) {
          console.error('Invalid data for send_message:', data);
          return;
      }
  
      const { chatId, senderId, message } = data;
  
      try {
          const existingMessage = await prisma.message.findFirst({
              where: {
                  chat_id: parseInt(chatId),
                  sender_id: parseInt(senderId),
                  content: message.content,
                  sent_at: {
                      gte: new Date(Date.now() - 5000) 
                  }
              }
          });

          if (existingMessage) {
              console.log('Duplicate message detected, skipping:', existingMessage);
              return;
          }

          const newMessage = await prisma.message.create({
              data: {
                  chat_id: parseInt(chatId),
                  sender_id: parseInt(senderId),
                  content: message.content,
                  message_type: message.type || "TEXT", 
              },
          });
  
          console.log('Broadcasting message:', newMessage);
          io.to(`chat_${chatId}`).emit('receive_message', newMessage);
      } catch (error) {
          console.error('Error handling send_message:', error);
      }
  });

    socket.on('send_audio', async (data) => {
      if (!data || !data.chatId || !data.senderId || !data.audioUrl) {
          console.error('Invalid data for send_audio:', data);
          return;
      }
  
      const { chatId, senderId, audioUrl, message } = data;
  
      try {
          const newMessage = await prisma.message.create({
              data: {
                  chat_id: parseInt(chatId),
                  sender_id: parseInt(senderId),
                  content: audioUrl,
                  message_type: "AUDIO",
                  voice_file_url: audioUrl
              },
              include: {
                  sender: true
              }
          });
  
          console.log('Broadcasting audio message:', newMessage);
          io.to(`chat_${chatId}`).emit('receive_message', {
              ...newMessage,
              voice_file_url: audioUrl
          });
      } catch (error) {
          console.error('Error handling send_audio:', error);
      }
  });

    socket.on('leave_chat', (chatId) => {
      socket.leave(`chat_${chatId}`);
      console.log(`Socket ${socket.id} left chat ${chatId}`);
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