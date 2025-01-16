const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all sports
const getAllSports = async (req, res) => {
    try {
        const sports = await prisma.sport.findMany({
            orderBy: {
                name: 'asc'
            }
        });
        res.json(sports);
    } catch (error) {
        console.error('Error getting sports:', error);
        res.status(500).json({ error: 'Failed to get sports' });
    }
};

// Get user's sports
const getUserSports = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const userSports = await prisma.userSport.findMany({
            where: { user_id: userId },
            include: {
                sport: true
            }
        });
        res.json(userSports);
    } catch (error) {
        console.error('Error getting user sports:', error);
        res.status(500).json({ error: 'Failed to get user sports' });
    }
};

// Add a sport to user's interests
const addUserSport = async (req, res) => {
    try {
        const { userId, sportId } = req.body;
        
        // Check if this sport is already added
        const existingSport = await prisma.userSport.findFirst({
            where: {
                user_id: userId,
                sport_id: sportId
            }
        });

        if (existingSport) {
            return res.status(400).json({ error: 'Sport already added to user interests' });
        }

        const userSport = await prisma.userSport.create({
            data: {
                user_id: userId,
                sport_id: sportId
            },
            include: {
                sport: true
            }
        });
        res.json(userSport);
    } catch (error) {
        console.error('Error adding sport:', error);
        res.status(500).json({ error: 'Failed to add sport' });
    }
};

// Remove a sport from user's interests
const removeUserSport = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const sportId = parseInt(req.params.sportId);
        
        await prisma.userSport.deleteMany({
            where: {
                user_id: userId,
                sport_id: sportId
            }
        });
        res.json({ message: 'Sport removed successfully' });
    } catch (error) {
        console.error('Error removing sport:', error);
        res.status(500).json({ error: 'Failed to remove sport' });
    }
};

module.exports = {
    getAllSports,
    getUserSports,
    addUserSport,
    removeUserSport
};