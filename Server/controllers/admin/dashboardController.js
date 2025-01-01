const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                user_id: true,
                username: true,
                email: true,
                skill_level: true,
                points: true,
                is_banned: true,
                is_blocked: true
            }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

// Get all events
const getAllEvents = async (req, res) => {
    try {
        const events = await prisma.event.findMany({
            include: {
                creator: {
                    select: {
                        username: true
                    }
                },
                event_participants: true
            }
        });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching events', error: error.message });
    }
};

// Get all competitions (tournaments)
const getAllCompetitions = async (req, res) => {
    try {
        const tournaments = await prisma.tournament.findMany({
            include: {
                creator: {
                    select: {
                        username: true
                    }
                },
                teams: true
            }
        });
        res.json(tournaments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching competitions', error: error.message });
    }
};

// Get all products
const getAllProducts = async (req, res) => {
    try {
        const products = await prisma.marketplaceProduct.findMany({
            include: {
                sport: true
            }
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
};

// Get all reports
const getAllReports = async (req, res) => {
    try {
        const reports = await prisma.report.findMany({
            include: {
                reported_user: {
                    select: {
                        username: true,
                        email: true
                    }
                },
                reporter: {
                    select: {
                        username: true
                    }
                },
                admin: {
                    select: {
                        username: true
                    }
                }
            }
        });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reports', error: error.message });
    }
};

// Get events of the day
const getEventsOfDay = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const events = await prisma.event.findMany({
            where: {
                date: {
                    gte: today,
                    lt: tomorrow
                }
            },
            include: {
                event_participants: true
            }
        });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching events of the day', error: error.message });
    }
};

// Get competitions of the day
const getCompetitionsOfDay = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const competitions = await prisma.tournament.findMany({
            where: {
                start_date: {
                    gte: today,
                    lt: tomorrow
                }
            },
            include: {
                teams: true
            }
        });
        res.json(competitions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching competitions of the day', error: error.message });
    }
};

// Get top users by level
const getTopUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: {
                points: 'desc'
            },
            take: 10,
            select: {
                username: true,
                points: true,
                skill_level: true
            }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching top users', error: error.message });
    }
};

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
    try {
        const [totalUsers, totalEvents, totalCompetitions, totalSales] = await Promise.all([
            prisma.user.count(),
            prisma.event.count(),
            prisma.tournament.count(),
            prisma.order.aggregate({
                _sum: {
                    total_amount: true
                }
            })
        ]);

        res.json({
            totalUsers,
            totalEvents,
            totalCompetitions,
            totalSales: totalSales._sum.total_amount || 0
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
    }
};

module.exports = {
    getAllUsers,
    getAllEvents,
    getAllCompetitions,
    getAllProducts,
    getAllReports,
    getEventsOfDay,
    getCompetitionsOfDay,
    getTopUsers,
    getDashboardStats
};
