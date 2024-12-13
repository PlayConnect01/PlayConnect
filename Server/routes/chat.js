const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const chatController = require('../controllers/chat');

// Route pour récupérer l'historique des messages d'un chat
router.get('/:chatId/messages', async (req, res) => {
    const { chatId } = req.params;
    try {
        const messages = await chatController.getChatMessages(chatId);
        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route pour envoyer un nouveau message
router.post('/:chatId/messages', async (req, res) => {
    const { chatId } = req.params;
    const { senderId, content } = req.body;

    try {
        // Logic to save the message to the database
        const newMessage = await chatController.sendMessage(chatId, senderId, content);
        res.status(201).json(newMessage); // Respond with the created message
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route pour créer un nouveau chat après un match
router.post('/create', async (req, res) => {
    try {
        const { matchId } = req.body;
        const chat = await chatController.createChatWithWelcomeMessage(matchId);
        res.json(chat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route pour vérifier les membres d'un chat
router.get('/:chatId/members', async (req, res) => {
    try {
        const { chatId } = req.params;
        const members = await prisma.chat_members.findMany({
            where: { chat_id: chatId },
            include: { user: true }
        });
        res.json(members);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route pour vérifier si un utilisateur fait partie d'un chat
router.get('/:chatId/verify/:userId', async (req, res) => {
    try {
        const { chatId, userId } = req.params;
        const isUserInChat = await chatController.verifyUserInChat(userId, chatId);
        res.json({ isUserInChat });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route pour obtenir tous les chats d'un utilisateur
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const chats = await prisma.chat_members.findMany({
            where: { user_id: userId },
            include: {
                chat: {
                    include: {
                        chat_members: {
                            include: {
                                user: true
                            }
                        },
                        messages: {
                            orderBy: {
                                timestamp: 'desc'
                            },
                            take: 1
                        }
                    }
                }
            }
        });
        res.json(chats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



module.exports = router; 