const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const adminAuth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No authentication token, access denied' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized as admin' });
        }

        // Get admin from database
        const admin = await prisma.admin.findUnique({
            where: { admin_id: decoded.id }
        });

        if (!admin) {
            return res.status(401).json({ message: 'Admin not found' });
        }

        // Attach admin to request object
        req.admin = admin;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = adminAuth;
