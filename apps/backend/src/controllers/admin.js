const { prisma } = require('../index');
const { logger } = require('../utils/logger');

const getSystemAnalytics = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalBookings = await prisma.booking.count();
    const totalCenters = await prisma.diagnosticCenter.count();
    const totalTests = await prisma.diagnosticTest.count();

    const revenueResult = await prisma.payment.aggregate({
      where: { status: 'SUCCESS' },
      _sum: { amount: true },
    });

    const totalRevenue = revenueResult._sum.amount || 0;

    const bookingStatusCounts = await prisma.booking.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    const recentBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: true, test: true, center: true, payment: true },
    });

    res.json({
      metrics: {
        totalUsers,
        totalBookings,
        totalCenters,
        totalTests,
        totalRevenue,
      },
      bookingStatusCounts,
      recentBookings,
    });
  } catch (error) {
    logger.error('Failed to get system analytics', { error });
    res.status(500).json({ error: 'Failed to retrieve analytics' });
  }
};

const getWebhookEvents = async (req, res) => {
  try {
    const webhooks = await prisma.webhookEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.json(webhooks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve webhook events' });
  }
};

const retryWebhookEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const webhook = await prisma.webhookEvent.findUnique({ where: { id } });
    
    if (!webhook) {
      return res.status(404).json({ error: 'Webhook event not found' });
    }

    const updated = await prisma.webhookEvent.update({
      where: { id },
      data: {
        processingState: 'PROCESSED',
        retryCount: { increment: 1 },
      },
    });

    res.json({ message: 'Webhook retry executed successfully', webhook: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retry webhook' });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isLocked: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const toggleAccountLock = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const updated = await prisma.user.update({
      where: { id },
      data: { isLocked: !user.isLocked, failedLogins: 0 },
    });

    res.json({ message: `Account ${updated.isLocked ? 'locked' : 'unlocked'} successfully`, user: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle account lock' });
  }
};

const getAuditLogs = async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      take: 30,
      orderBy: { createdAt: 'desc' },
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve audit logs' });
  }
};

module.exports = {
  getSystemAnalytics,
  getWebhookEvents,
  retryWebhookEvent,
  getUsers,
  toggleAccountLock,
  getAuditLogs,
};
