const { prisma, redis } = require("../index");
const { logger } = require("../utils/logger");

const TERMINAL_STATUSES = ["CANCELLED", "COMPLETED", "FAILED"];

const createBooking = async (req, res) => {
  try {
    const { testId, centerId, appointmentDate } = req.body;
    const userId = req.user.id;

    // Zod already validated fields — these checks are defence-in-depth
    const test = await prisma.diagnosticTest.findUnique({
      where: { id: testId },
      include: { center: true },
    });

    if (!test || test.centerId !== centerId) {
      return res.status(400).json({ error: "Invalid test or diagnostic center selection" });
    }

    const apptDateObj = new Date(appointmentDate);
    if (apptDateObj <= new Date()) {
      return res.status(400).json({ error: "Appointment date must be a future timestamp" });
    }

    // Normalise to the minute to prevent double-booking on millisecond differences
    const normalizedTime = new Date(apptDateObj.setSeconds(0, 0)).toISOString();
    const slotLockKey = `lock:slot:${centerId}:${testId}:${normalizedTime}`;

    const lockAcquired = await redis.set(slotLockKey, userId, "EX", 15, "NX");
    if (!lockAcquired) {
      return res.status(409).json({
        error: "This slot is currently being reserved by another booking. Please try again in a few seconds.",
      });
    }

    try {
      const existingBooking = await prisma.booking.findFirst({
        where: {
          centerId,
          testId,
          appointmentDate: new Date(normalizedTime),
          status: { in: ["PENDING", "CONFIRMED"] },
        },
      });

      if (existingBooking) {
        return res.status(409).json({ error: "Slot is already booked for this test at the specified time." });
      }

      const booking = await prisma.$transaction(async (tx) => {
        const newBooking = await tx.booking.create({
          data: {
            userId,
            testId,
            centerId,
            appointmentDate: new Date(normalizedTime),
            amount: test.price,
            status: "PENDING",
          },
          include: { test: true, center: true },
        });

        const payment = await tx.payment.create({
          data: {
            bookingId: newBooking.id,
            amount: test.price,
            currency: "INR",
            gatewayOrderId: `order_EVE_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            status: "PENDING",
          },
        });

        await tx.auditLog.create({
          data: {
            action: "BOOKING_CREATED",
            entityType: "BOOKING",
            entityId: newBooking.id,
            userId,
            details: { testName: test.name, amount: test.price },
          },
        });

        return { ...newBooking, payment };
      });

      logger.info(`Booking created: ${booking.id} for user ${userId}`);
      res.status(201).json(booking);
    } finally {
      await redis.del(slotLockKey);
    }
  } catch (error) {
    logger.error("Failed to create booking", { error: error.message });
    res.status(500).json({ error: "Internal server error while creating booking" });
  }
};

const getBookings = async (req, res) => {
  try {
    const { id: userId, role: userRole } = req.user;

    // Patients see only their own bookings; admins see all
    const whereClause = userRole === "PATIENT" ? { userId } : {};

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        test: true,
        center: true,
        payment: true,
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(bookings);
  } catch (error) {
    logger.error("Failed to retrieve bookings", { error: error.message });
    res.status(500).json({ error: "Failed to retrieve bookings" });
  }
};

const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        test: true,
        center: true,
        payment: { include: { events: true } },
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (req.user.role === "PATIENT" && booking.userId !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(booking);
  } catch (error) {
    logger.error("Failed to retrieve booking", { error: error.message });
    res.status(500).json({ error: "Failed to retrieve booking details" });
  }
};

const rescheduleBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { newDate } = req.body;

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (req.user.role === "PATIENT" && booking.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden: You can only reschedule your own bookings" });
    }

    if (TERMINAL_STATUSES.includes(booking.status)) {
      return res.status(400).json({ error: `Cannot reschedule a booking in ${booking.status} status` });
    }

    const newDateObj = new Date(newDate);
    if (newDateObj <= new Date()) {
      return res.status(400).json({ error: "New appointment date must be a future timestamp" });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { appointmentDate: newDateObj, status: "RESCHEDULED" },
      include: { test: true, center: true },
    });

    logger.info(`Booking ${id} rescheduled to ${newDate}`);
    res.json({ message: "Booking rescheduled successfully", booking: updated });
  } catch (error) {
    logger.error("Failed to reschedule booking", { error: error.message });
    res.status(500).json({ error: "Failed to reschedule booking" });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (req.user.role === "PATIENT" && booking.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden: You can only cancel your own bookings" });
    }

    if (booking.status === "CANCELLED") {
      return res.status(400).json({ error: "Booking is already cancelled" });
    }

    if (booking.status === "COMPLETED") {
      return res.status(400).json({ error: "Cannot cancel a completed booking" });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    await prisma.auditLog.create({
      data: {
        action: "BOOKING_CANCELLED",
        entityType: "BOOKING",
        entityId: id,
        userId: req.user.id,
        details: { previousStatus: booking.status },
      },
    });

    logger.info(`Booking ${id} cancelled by user ${req.user.id}`);
    res.json({ message: "Booking cancelled successfully", booking: updated });
  } catch (error) {
    logger.error("Failed to cancel booking", { error: error.message });
    res.status(500).json({ error: "Failed to cancel booking" });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Already validated by Zod

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const updated = await prisma.booking.update({
      where: { id },
      data: { status },
    });

    await prisma.auditLog.create({
      data: {
        action: "BOOKING_STATUS_UPDATED",
        entityType: "BOOKING",
        entityId: id,
        userId: req.user.id,
        details: { from: booking.status, to: status },
      },
    });

    res.json({ message: `Booking status updated to ${status}`, booking: updated });
  } catch (error) {
    logger.error("Failed to update booking status", { error: error.message });
    res.status(500).json({ error: "Failed to update booking status" });
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  rescheduleBooking,
  cancelBooking,
  updateBookingStatus,
};
