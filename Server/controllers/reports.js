const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createReport = async (req, res) => {
  const { userId, reason, reportedBy } = req.body;

  try {
    const report = await prisma.report.create({
      data: {
        reported_user_id: userId,
        reported_by: reportedBy, 
        reason,
        status: 'PENDING', 
      },
    });
    res.status(201).json({ message: 'Report created successfully', report });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ error: 'Failed to create report' });
  }
};

const getReports = async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        reported_user: {
          select: {
            username: true,
            profile_picture: true,
            user_id: true
          }
        },
        reporter: {
          select: {
            username: true,
            profile_picture: true,
            user_id: true
          }
        }
      }
    });
    res.status(200).json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

module.exports = {
  createReport,
  getReports,
};