const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const chatController = require('../controllers/chat');
const cloudinary = require('../config/cloudinary');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, `audio-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, 
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed'));
        }
    }
});

const imageStorage = multer.memoryStorage();
const imageUpload = multer({ 
    storage: imageStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

router.post('/audio/:chatId', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file provided' });
        }

        const chatId = req.params.chatId;
        const senderId = req.body.senderId;
        
        console.log('Received audio upload request:', {
            chatId,
            senderId,
            file: req.file
        });

        // Generate the URL for the uploaded file
        const fileName = path.basename(req.file.path);
        const fileUrl = `http://192.168.103.15:3000/uploads/${encodeURIComponent(fileName)}`;
        
        console.log('Generated audio URL:', fileUrl);
        
        const audioMessage = await chatController.handleAudioMessage(
            parseInt(chatId),
            parseInt(senderId),
            fileUrl
        );
        
        res.status(200).json(audioMessage);
    } catch (error) {
        console.error('Error handling audio upload:', error);
        res.status(500).json({ error: 'Failed to process audio message' });
    }
});

// Image upload route
router.post('/upload/image', imageUpload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const chatId = req.body.chatId;
        const senderId = req.body.senderId;

        // Convert buffer to base64
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
            resource_type: 'image',
            folder: 'chat_images'
        });

        // Handle the image message using controller
        const message = await chatController.handleImageMessage(chatId, senderId, result.secure_url);
        
        res.status(201).json(message);
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ error: error.message });
    }
});

// Message routes
router.post('/message', async (req, res) => {
    try {
        const { chat_id, sender_id, content, message_type = 'TEXT' } = req.body;
        const message = await chatController.createMessage(
            parseInt(chat_id),
            parseInt(sender_id),
            content,
            message_type
        );
        res.json(message);
    } catch (error) {
        console.error('Error creating message:', error);
        res.status(500).json({ error: 'Failed to create message' });
    }
});

router.get('/:chatId/messages', async (req, res) => {
    try {
        console.log('Fetching messages for chat:', req.params.chatId);
        const chatId = parseInt(req.params.chatId);
        const messages = await chatController.getChatMessages(chatId);
        console.log('Found messages:', messages.length);
        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
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