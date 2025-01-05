const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createReport = async (req, res) => {
  const { userId, reason, reportedBy } = req.body; // Add reportedBy to the request body

  try {
    const report = await prisma.report.create({
      data: {
        reported_user_id: userId,
        reported_by: reportedBy, 
        reason,
        status: 'pending', 
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
    const reports = await prisma.report.findMany();
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