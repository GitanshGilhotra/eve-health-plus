const mongoose = require('mongoose');
const dns = require('dns');

// Fix for Windows / Node.js querySrv ECONNREFUSED when resolving MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore if custom DNS cannot be assigned
}

const connectMongoDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/eve_health';
  try {
    await mongoose.connect(uri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 6000,
    });
    console.log('🍃 MongoDB connected successfully via Mongoose ODM');
  } catch (error) {
    console.warn('⚠️ MongoDB Mongoose connection failed (Make sure IP is whitelisted in Atlas or MongoDB is running):', error.message);
  }
};

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['PATIENT', 'CENTER_ADMIN', 'PLATFORM_ADMIN'], default: 'PATIENT' },
  isLocked: { type: Boolean, default: false },
  failedLogins: { type: Number, default: 0 },
}, { timestamps: true });

// Diagnostic Center Schema
const centerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Diagnostic Test Schema
const testSchema = new mongoose.Schema({
  centerId: { type: mongoose.Schema.Types.ObjectId, ref: 'DiagnosticCenter', required: true },
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String, default: 'General Wellness' },
  prepInstructions: { type: String },
  price: { type: Number, required: true },
  durationMin: { type: Number, default: 30 },
}, { timestamps: true });

// Booking Schema
const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'DiagnosticTest', required: true },
  centerId: { type: mongoose.Schema.Types.ObjectId, ref: 'DiagnosticCenter', required: true },
  appointmentDate: { type: Date, required: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'FAILED', 'CANCELLED', 'RESCHEDULED', 'COMPLETED'],
    default: 'PENDING',
  },
}, { timestamps: true });

// Payment Schema
const paymentSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  gatewayOrderId: { type: String },
  gatewayPaymentId: { type: String },
  status: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'REFUNDED'],
    default: 'PENDING',
  },
}, { timestamps: true });

// Webhook Event Schema
const webhookEventSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true },
  provider: { type: String, default: 'razorpay' },
  eventType: { type: String, required: true },
  payloadHash: { type: String, required: true },
  processingState: { type: String, default: 'PENDING' },
  retryCount: { type: Number, default: 0 },
}, { timestamps: true });

// Medical Report Schema
const medicalReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileUrl: { type: String, required: true },
  testType: { type: String, required: true },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const DiagnosticCenter = mongoose.models.DiagnosticCenter || mongoose.model('DiagnosticCenter', centerSchema);
const DiagnosticTest = mongoose.models.DiagnosticTest || mongoose.model('DiagnosticTest', testSchema);
const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
const WebhookEvent = mongoose.models.WebhookEvent || mongoose.model('WebhookEvent', webhookEventSchema);
const MedicalReport = mongoose.models.MedicalReport || mongoose.model('MedicalReport', medicalReportSchema);

module.exports = {
  connectMongoDB,
  User,
  DiagnosticCenter,
  DiagnosticTest,
  Booking,
  Payment,
  WebhookEvent,
  MedicalReport,
};
