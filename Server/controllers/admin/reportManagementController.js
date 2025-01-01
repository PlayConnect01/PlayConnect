const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Handle report (accept or reject)
const handleReport = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { status, actionTaken } = req.body;
        const adminId = req.admin.id; // From auth middleware

        const report = await prisma.report.update({
            where: { report_id: parseInt(reportId) },
            data: {
                status,
                action_taken: actionTaken,
                handled_by: adminId,
                handled_at: new Date()
            },
            include: {
                reported_user: true,
                reporter: true,
                admin: true
            }
        });

        res.json({ message: 'Report handled successfully', report });
    } catch (error) {
        res.status(500).json({ message: 'Error handling report', error: error.message });
    }
};

// Get pending reports
const getPendingReports = async (req, res) => {
    try {
        const reports = await prisma.report.findMany({
            where: {
                status: 'PENDING'
            },
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
                }
            }
        });

        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pending reports', error: error.message });
    }
};

module.exports = {
    handleReport,
    getPendingReports
};
