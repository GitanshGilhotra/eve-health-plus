const crypto = require('crypto');
const { prisma } = require('../index');
const { logger } = require('../utils/logger');

const createRazorpayOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const orderId = `order_EVE_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const payment = await prisma.payment.upsert({
      where: { bookingId },
      update: {
        gatewayOrderId: orderId,
        status: 'PROCESSING',
      },
      create: {
        bookingId,
        amount: booking.amount,
        currency: 'INR',
        gatewayOrderId: orderId,
        status: 'PROCESSING',
      },
    });

    res.json({
      orderId,
      amount: booking.amount,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_evehealth_key',
    });
  } catch (error) {
    logger.error('Failed to create payment order', { error });
    res.status(500).json({ error: 'Failed to create payment order' });
  }
};

const simulatePayment = async (req, res) => {
  try {
    const { bookingId, outcome } = req.body;
    
    if (!bookingId) {
      return res.status(400).json({ error: 'bookingId is required' });
    }

    const paymentStatus = outcome === 'FAILED' ? 'FAILED' : 'SUCCESS';
    const bookingStatus = outcome === 'FAILED' ? 'FAILED' : 'CONFIRMED';
    const paymentId = `pay_EVE_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.upsert({
        where: { bookingId },
        update: {
          gatewayPaymentId: paymentId,
          status: paymentStatus,
        },
        create: {
          bookingId,
          amount: 500.0,
          currency: 'INR',
          gatewayPaymentId: paymentId,
          status: paymentStatus,
        },
      });

      await tx.paymentEvent.create({
        data: {
          paymentId: payment.id,
          status: paymentStatus,
          payload: { simulation: true, outcome, timestamp: new Date() },
        },
      });

      const booking = await tx.booking.update({
        where: { id: bookingId },
        data: { status: bookingStatus },
      });

      return { payment, booking };
    });

    logger.info(`Simulated payment ${paymentStatus} for booking ${bookingId}`);

    res.json({
      message: `Simulated payment result: ${paymentStatus}`,
      payment: result.payment,
      booking: result.booking,
    });
  } catch (error) {
    logger.error('Simulate payment failed', { error });
    res.status(500).json({ error: 'Internal server error during payment simulation' });
  }
};

const verifyPaymentSignature = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;
    const secret = process.env.RAZORPAY_KEY_SECRET || 'dev_razorpay_secret';

    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isValid = generatedSignature === razorpay_signature || process.env.NODE_ENV !== 'production';

    if (isValid) {
      await prisma.$transaction([
        prisma.payment.update({
          where: { bookingId },
          data: {
            gatewayPaymentId: razorpay_payment_id,
            status: 'SUCCESS',
          },
        }),
        prisma.booking.update({
          where: { id: bookingId },
          data: { status: 'CONFIRMED' },
        }),
      ]);

      return res.json({ status: 'SUCCESS', message: 'Payment verified and booking confirmed' });
    } else {
      await prisma.payment.update({
        where: { bookingId },
        data: { status: 'FAILED' },
      });
      return res.status(400).json({ status: 'FAILED', error: 'Invalid payment signature' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Signature verification failed' });
  }
};

const refundPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const payment = await prisma.payment.findUnique({ where: { bookingId } });
    if (!payment || payment.status !== 'SUCCESS') {
      return res.status(400).json({ error: 'No successful payment found for refund' });
    }

    const updatedPayment = await prisma.payment.update({
      where: { bookingId },
      data: { status: 'REFUNDED' },
    });

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
    });

    res.json({ message: 'Payment refunded successfully', payment: updatedPayment });
  } catch (error) {
    res.status(500).json({ error: 'Refund processing failed' });
  }
};

module.exports = {
  createRazorpayOrder,
  simulatePayment,
  verifyPaymentSignature,
  refundPayment,
};
