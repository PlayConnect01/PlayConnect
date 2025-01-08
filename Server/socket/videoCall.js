const prisma = require('../prisma');

const handleVideoCallEvents = (socket, io) => {
  // Handle video call request
  socket.on('videoCallRequest', async (data) => {
    try {
      console.log('Received video call request:', data);
      const { chatId, callerId, receiverId, callerName } = data;
      
      // Create a unique channel name
      const channelName = `call_${chatId}_${Date.now()}`;
      
      // Create video call record in database
      const videoCall = await prisma.videoCall.create({
        data: {
          channel_name: channelName,
          status: 'INITIATED',
          chat: {
            connect: {
              chat_id: parseInt(chatId)
            }
          },
          initiator: {
            connect: {
              user_id: parseInt(callerId)
            }
          },
          participant: {
            connect: {
              user_id: parseInt(receiverId)
            }
          }
        }
      });
  
      console.log('Video call record created:', videoCall);
  
      // Emit to the chat room
      io.in(`chat_${chatId}`).emit('receiveVideoCall', {
        chatId,
        callerId,
        callerName,
        receiverId,
        channelName,
        videoCallId: videoCall.id
      });
      
      console.log(`Video call request sent in chat ${chatId} from ${callerId} to ${receiverId}`);
    } catch (error) {
      console.error('Error creating video call:', error);
      socket.emit('error', { 
        message: 'Failed to create video call',
        details: error.message 
      });
    }
  });

  // Handle call acceptance
  socket.on('videoCallAccepted', async (data) => {
    try {
      const { chatId, receiverId, callerId, channelName } = data;
      
      const videoCall = await prisma.videoCall.findFirst({
        where: {
          channel_name: channelName,
          status: 'INITIATED'
        }
      });

      if (videoCall) {
        await prisma.videoCall.update({
          where: {
            id: videoCall.id
          },
          data: {
            status: 'ONGOING'
          }
        });

        socket.to(`chat_${chatId}`).emit('receiveVideoCallAccepted', {
          chatId,
          receiverId,
          callerId,
          channelName
        });
      }
    } catch (error) {
      console.error('Error handling video call acceptance:', error);
      socket.emit('error', { message: 'Failed to handle call acceptance' });
    }
  });

  // Handle call rejection
  socket.on('videoCallRejected', async (data) => {
    try {
      const { chatId, receiverId, callerId, channelName } = data;
      
      const videoCall = await prisma.videoCall.findFirst({
        where: {
          channel_name: channelName,
          status: 'INITIATED'
        }
      });

      if (videoCall) {
        await prisma.videoCall.update({
          where: {
            id: videoCall.id
          },
          data: {
            status: 'MISSED',
            ended_at: new Date()
          }
        });

        socket.to(`chat_${chatId}`).emit('receiveVideoCallRejected', {
          chatId,
          receiverId,
          callerId
        });
      }
    } catch (error) {
      console.error('Error handling video call rejection:', error);
      socket.emit('error', { message: 'Failed to handle call rejection' });
    }
  });

  // Handle call end
  socket.on('videoCallEnd', async (data) => {
    try {
      const { chatId, callerId, receiverId, channelName } = data;
      
      const videoCall = await prisma.videoCall.findFirst({
        where: {
          channel_name: channelName,
          OR: [
            { status: 'INITIATED' },
            { status: 'ONGOING' }
          ]
        }
      });

      if (videoCall) {
        await prisma.videoCall.update({
          where: {
            id: videoCall.id
          },
          data: {
            status: 'COMPLETED',
            ended_at: new Date()
          }
        });

        socket.to(`chat_${chatId}`).emit('receiveVideoCallEnded', {
          chatId,
          callerId,
          receiverId
        });
      }
    } catch (error) {
      console.error('Error handling video call end:', error);
      socket.emit('error', { message: 'Failed to handle call end' });
    }
  });
};

module.exports = handleVideoCallEvents;
