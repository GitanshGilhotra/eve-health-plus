const { prisma } = require('../index');

const getMedicalReports = async (req, res) => {
  try {
    const userId = req.user.id;
    const reports = await prisma.medicalReport.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve medical reports' });
  }
};

const uploadMockReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { testType } = req.body;

    const report = await prisma.medicalReport.create({
      data: {
        userId,
        testType: testType || 'Comprehensive Diagnostics',
        fileUrl: `https://evehealth-reports.s3.amazonaws.com/report_${Date.now()}.pdf`,
      },
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate medical report' });
  }
};

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve notifications' });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
};

module.exports = {
  getMedicalReports,
  uploadMockReport,
  getNotifications,
  markNotificationRead,
};
