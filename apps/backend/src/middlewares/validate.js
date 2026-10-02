const { z } = require("zod");

/**
 * Zod schema validation middleware factory.
 * Validates req.body against the provided Zod schema.
 * Returns HTTP 422 with structured field errors on failure.
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return res.status(422).json({ error: "Validation failed", details: errors });
  }
  req.body = result.data;
  next();
};

// Auth Schemas
const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  role: z.enum(["PATIENT", "CENTER_ADMIN", "PLATFORM_ADMIN"]).optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Center Schemas
const createCenterSchema = z.object({
  name: z.string().min(2, "Center name must be at least 2 characters").max(100),
  location: z.string().min(2, "Location is required").max(200),
  contactEmail: z.string().email("Invalid contact email"),
  contactPhone: z.string().optional(),
});

const createTestSchema = z.object({
  name: z.string().min(2, "Test name is required").max(100),
  description: z.string().max(500).optional(),
  category: z.string().max(100).optional(),
  prepInstructions: z.string().max(1000).optional(),
  price: z.number({ invalid_type_error: "Price must be a number" }).positive("Price must be positive"),
  durationMin: z.number().int().positive().optional(),
});

// Booking Schemas
const createBookingSchema = z.object({
  testId: z.string().min(1, "testId is required"),
  centerId: z.string().min(1, "centerId is required"),
  appointmentDate: z.string().datetime({ message: "appointmentDate must be a valid ISO 8601 datetime" }),
});

const rescheduleBookingSchema = z.object({
  newDate: z.string().datetime({ message: "newDate must be a valid ISO 8601 datetime" }),
});

const updateBookingStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "FAILED", "CANCELLED", "RESCHEDULED", "COMPLETED"], {
    errorMap: () => ({ message: "status must be one of: PENDING, CONFIRMED, FAILED, CANCELLED, RESCHEDULED, COMPLETED" }),
  }),
});

// Payment Schemas
const simulatePaymentSchema = z.object({
  bookingId: z.string().min(1, "bookingId is required"),
  outcome: z.enum(["SUCCESS", "FAILED"]).optional().default("SUCCESS"),
});

const createOrderSchema = z.object({
  bookingId: z.string().min(1, "bookingId is required"),
});

const refundSchema = z.object({
  bookingId: z.string().min(1, "bookingId is required"),
});

module.exports = {
  validate,
  schemas: {
    registerSchema,
    loginSchema,
    createCenterSchema,
    createTestSchema,
    createBookingSchema,
    rescheduleBookingSchema,
    updateBookingStatusSchema,
    simulatePaymentSchema,
    createOrderSchema,
    refundSchema,
  },
};
