const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const verifyToken = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'No token provided'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

        // Get user from database
        const user = await prisma.user.findUnique({
            where: {
                user_id: decoded.user_id
            }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'User not found'
            });
        }

        // Add user to request object
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        return res.status(401).json({
            success: false,
            error: 'Invalid token'
        });
    }
};

module.exports = {
    verifyToken
};
