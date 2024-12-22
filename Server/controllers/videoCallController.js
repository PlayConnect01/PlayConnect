const WebSocket = require('ws');

const handleVideoCall = (server) => {
  const wss = new WebSocket.Server({ 
    server,
    path: '/webrtc'
  });

  const clients = new Map();

  wss.on('connection', (ws, req) => {
    const userId = req.url.split('?userId=')[1];
    if (userId) {
      clients.set(userId, ws);
      console.log(`Client ${userId} connected`);
    }

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        const { type, recipientId } = data;
        const recipientWs = clients.get(recipientId);

        if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
          recipientWs.send(JSON.stringify(data));
          console.log(`Message type ${type} forwarded to ${recipientId}`);
        } else {
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'Recipient not found or not connected' 
          }));
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Invalid message format' 
        }));
      }
    });

    ws.on('close', () => {
      if (userId) {
        clients.delete(userId);
        console.log(`Client ${userId} disconnected`);
        
        for (const [, client] of clients) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'user-disconnected',
              userId: userId
            }));
          }
        }
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  setInterval(() => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.CLOSED) {
        for (const [userId, ws] of clients.entries()) {
          if (ws === client) {
            clients.delete(userId);
            console.log(`Removed stale connection for ${userId}`);
            break;
          }
        }
      }
    });
  }, 30000);
};

module.exports = handleVideoCall;
