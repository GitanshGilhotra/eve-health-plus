const crypto = require('crypto');
const { prisma, redis } = require('../index');
const { logger } = require('../utils/logger');

const handlePaymentWebhook = async (req, res) => {
  try {
    const { eventId, eventType, paymentId, bookingId, status } = req.body;
    
    if (!eventId || (!paymentId && !bookingId) || !status) {
      return res.status(400).json({ error: 'Invalid webhook payload structure. Mandatory fields: eventId, status, and paymentId or bookingId.' });
    }

    const payloadHash = crypto.createHash('sha256').update(JSON.stringify(req.body)).digest('hex');

    const lockKey = `webhook_lock:${eventId}`;
    const lockAcquired = await redis.set(lockKey, 'LOCKED', 'EX', 30, 'NX');
    
    if (!lockAcquired) {
      logger.info(`Webhook event ${eventId} currently locked by another concurrent process.`);
      return res.status(202).json({ message: 'Event is already being processed concurrently' });
    }

    try {
      let webhookEvent = await prisma.webhookEvent.findUnique({ where: { eventId } });
      
      if (webhookEvent && webhookEvent.processingState === 'PROCESSED') {
        logger.info(`Webhook event ${eventId} already processed idempotently. Skipping processing.`);
        return res.status(200).json({
          message: 'Event already processed idempotently',
          eventId,
          status: webhookEvent.processingState,
        });
      }

      if (!webhookEvent) {
        webhookEvent = await prisma.webhookEvent.create({
          data: {
            eventId,
            eventType: eventType || 'payment.updated',
            payloadHash,
            processingState: 'PENDING',
          },
        });
      }

      await prisma.$transaction(async (tx) => {
        let payment;
        if (paymentId) {
          payment = await tx.payment.findUnique({ where: { id: paymentId } });
        } else if (bookingId) {
          payment = await tx.payment.findUnique({ where: { bookingId } });
        }

        if (!payment) {
          throw new Error(`Target payment not found for event ${eventId}`);
        }

        if (payment.status === 'SUCCESS' || payment.status === 'REFUNDED') {
          logger.info(`Payment ${payment.id} already in final state ${payment.status}. Ignoring update.`);
          await tx.webhookEvent.update({
            where: { id: webhookEvent.id },
            data: { processingState: 'PROCESSED' },
          });
          return;
        }

        await tx.payment.update({
          where: { id: payment.id },
          data: { status },
        });

        await tx.paymentEvent.create({
          data: { paymentId: payment.id, status, payload: req.body },
        });

        let bookingStatus = 'PENDING';
        if (status === 'SUCCESS') bookingStatus = 'CONFIRMED';
        if (status === 'FAILED') bookingStatus = 'FAILED';
        if (status === 'REFUNDED') bookingStatus = 'CANCELLED';

        await tx.booking.update({
          where: { id: payment.bookingId },
          data: { status: bookingStatus },
        });

        await tx.webhookEvent.update({
          where: { id: webhookEvent.id },
          data: { processingState: 'PROCESSED' },
        });
      });

      res.status(200).json({ message: 'Webhook processed successfully', eventId });
    } finally {
      await redis.del(lockKey);
    }
  } catch (error) {
    logger.error('Webhook processing failed', { error: error.message });
    
    if (req.body.eventId) {
      await prisma.webhookEvent.update({
        where: { eventId: req.body.eventId },
        data: {
          processingState: 'FAILED',
          retryCount: { increment: 1 },
        },
      }).catch(console.error);
    }

    res.status(500).json({ error: error.message || 'Internal server error while processing webhook' });
  }
};

module.exports = { handlePaymentWebhook };
