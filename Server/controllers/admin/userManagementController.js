const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Ban a user
const banUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;

        const user = await prisma.user.update({
            where: { user_id: parseInt(userId) },
            data: {
                is_banned: true,
                ban_reason: reason
            }
        });

        res.json({ message: 'User banned successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Error banning user', error: error.message });
    }
};

// Unban a user
const unbanUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await prisma.user.update({
            where: { user_id: parseInt(userId) },
            data: {
                is_banned: false,
                ban_reason: null
            }
        });

        res.json({ message: 'User unbanned successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Error unbanning user', error: error.message });
    }
};

// Block a user
const blockUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;

        const user = await prisma.user.update({
            where: { user_id: parseInt(userId) },
            data: {
                is_blocked: true,
                block_reason: reason
            }
        });

        res.json({ message: 'User blocked successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Error blocking user', error: error.message });
    }
};

// Unblock a user
const unblockUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await prisma.user.update({
            where: { user_id: parseInt(userId) },
            data: {
                is_blocked: false,
                block_reason: null
            }
        });

        res.json({ message: 'User unblocked successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Error unblocking user', error: error.message });
    }
};

module.exports = {
    banUser,
    unbanUser,
    blockUser,
    unblockUser
};
