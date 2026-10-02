const { Router } = require("express");
const { register, login, logout, refreshToken, getMe } = require("./controllers/auth");
const { getCenters, getCenterById, createCenter, createTest } = require("./controllers/centers");
const {
  createBooking,
  getBookings,
  getBookingById,
  rescheduleBooking,
  cancelBooking,
  updateBookingStatus,
} = require("./controllers/booking");
const {
  createRazorpayOrder,
  simulatePayment,
  verifyPaymentSignature,
  refundPayment,
} = require("./controllers/payment");
const { handlePaymentWebhook } = require("./controllers/webhook");
const {
  getSystemAnalytics,
  getWebhookEvents,
  retryWebhookEvent,
  getUsers,
  toggleAccountLock,
  getAuditLogs,
} = require("./controllers/admin");
const {
  getMedicalReports,
  uploadMockReport,
  getNotifications,
  markNotificationRead,
} = require("./controllers/patient");
const { authenticate, requireRole } = require("./middlewares/auth");
const { validate, schemas } = require("./middlewares/validate");

const router = Router();

// ==================== AUTH ROUTES ====================
router.post("/auth/register", validate(schemas.registerSchema), register);
router.post("/auth/login", validate(schemas.loginSchema), login);
router.post("/auth/logout", authenticate, logout);
router.post("/auth/refresh-token", refreshToken);
router.get("/auth/me", authenticate, getMe);

// ==================== CENTERS & TESTS ====================
router.get("/centers", getCenters);
router.get("/centers/:id", getCenterById);
router.post("/centers", authenticate, requireRole(["PLATFORM_ADMIN", "CENTER_ADMIN"]), validate(schemas.createCenterSchema), createCenter);
router.post("/centers/:centerId/tests", authenticate, requireRole(["PLATFORM_ADMIN", "CENTER_ADMIN"]), validate(schemas.createTestSchema), createTest);

// ==================== BOOKING ENGINE ====================
router.post("/bookings", authenticate, validate(schemas.createBookingSchema), createBooking);
router.get("/bookings", authenticate, getBookings);
router.get("/bookings/:id", authenticate, getBookingById);
router.patch("/bookings/:id/reschedule", authenticate, validate(schemas.rescheduleBookingSchema), rescheduleBooking);
router.patch("/bookings/:id/cancel", authenticate, cancelBooking);
router.patch("/bookings/:id/status", authenticate, requireRole(["PLATFORM_ADMIN", "CENTER_ADMIN"]), validate(schemas.updateBookingStatusSchema), updateBookingStatus);

// ==================== PAYMENT SYSTEM ====================
router.post("/payments/create-order", authenticate, validate(schemas.createOrderSchema), createRazorpayOrder);
router.post("/payments/simulate", authenticate, validate(schemas.simulatePaymentSchema), simulatePayment);
router.post("/payments/verify", authenticate, verifyPaymentSignature);
router.post("/payments/refund", authenticate, requireRole(["PLATFORM_ADMIN", "CENTER_ADMIN"]), validate(schemas.refundSchema), refundPayment);

// ==================== WEBHOOK SYSTEM ====================
router.post("/payments/webhook", handlePaymentWebhook);

// ==================== PATIENT SERVICES ====================
router.get("/patient/reports", authenticate, getMedicalReports);
router.post("/patient/reports", authenticate, uploadMockReport);
router.get("/patient/notifications", authenticate, getNotifications);
router.patch("/patient/notifications/:id/read", authenticate, markNotificationRead);

// ==================== ADMIN DASHBOARD ====================
router.get("/admin/analytics", authenticate, requireRole(["PLATFORM_ADMIN"]), getSystemAnalytics);
router.get("/admin/webhooks", authenticate, requireRole(["PLATFORM_ADMIN"]), getWebhookEvents);
router.post("/admin/webhooks/:id/retry", authenticate, requireRole(["PLATFORM_ADMIN"]), retryWebhookEvent);
router.get("/admin/users", authenticate, requireRole(["PLATFORM_ADMIN"]), getUsers);
router.patch("/admin/users/:id/toggle-lock", authenticate, requireRole(["PLATFORM_ADMIN"]), toggleAccountLock);
router.get("/admin/audit-logs", authenticate, requireRole(["PLATFORM_ADMIN"]), getAuditLogs);

module.exports = router;
