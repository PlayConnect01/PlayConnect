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

const updateReportStatus = async (req, res) => {
  const { reportId } = req.params;
  const { status, adminId } = req.body;

  try {
    // Use a transaction to handle both report update and notification
    const [updatedReport, notification] = await prisma.$transaction([
      // Update report status
      prisma.report.update({
        where: { report_id: parseInt(reportId) },
        data: {
          status: status.toUpperCase(),
          handled_by: parseInt(adminId),
          handled_at: new Date(),
        },
        include: {
          reported_user: true,
          reporter: true,
        }
      }),

      // Create notification for the reporter
      prisma.notification.create({
        data: {
          user_id: parseInt(req.body.reporterId),
          title: `Report ${status === 'RESOLVED' ? 'Resolved' : 'Dismissed'}`,
          content: status === 'RESOLVED' 
            ? "We've reviewed your report and taken appropriate action. Thank you for helping keep our community safe."
            : "We've reviewed your report and found no violation of our community guidelines.",
          type: "GENERAL",
          is_read: false,
        }
      })
    ]);

    res.json(updatedReport);
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ error: 'Failed to update report status' });
  }
};

module.exports = {
  createReport,
  getReports,
  updateReportStatus,
};