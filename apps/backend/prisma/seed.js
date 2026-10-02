const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.medicalReport.deleteMany();
  await prisma.paymentEvent.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.webhookEvent.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.diagnosticTest.deleteMany();
  await prisma.diagnosticCenter.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.userSession.deleteMany();
  await prisma.user.deleteMany();

  const defaultPasswordHash = await argon2.hash('Password123!');

  const patientUser = await prisma.user.create({
    data: {
      email: 'patient@evehealth.com',
      passwordHash: defaultPasswordHash,
      firstName: 'Sarah',
      lastName: 'Jenkins',
      role: 'PATIENT',
    },
  });

  const centerAdminUser = await prisma.user.create({
    data: {
      email: 'centeradmin@evehealth.com',
      passwordHash: defaultPasswordHash,
      firstName: 'Dr. Marcus',
      lastName: 'Vance',
      role: 'CENTER_ADMIN',
    },
  });

  const platformAdminUser = await prisma.user.create({
    data: {
      email: 'admin@evehealth.com',
      passwordHash: defaultPasswordHash,
      firstName: 'Elena',
      lastName: 'Rostova',
      role: 'PLATFORM_ADMIN',
    },
  });

  const center1 = await prisma.diagnosticCenter.create({
    data: {
      name: 'Apollo Health Diagnostic Hub',
      location: '102 Tech Park Boulevard, Silicon Valley, CA',
      contactEmail: 'contact@apollodiagnostics.com',
      contactPhone: '+1 (555) 234-5678',
      isActive: true,
      tests: {
        create: [
          {
            name: 'Complete Blood Count (CBC)',
            description: 'Evaluates overall health and detects a wide range of disorders, including anemia and infection.',
            category: 'Hematology',
            prepInstructions: 'No special preparation required. Fasting not mandatory.',
            price: 650,
            durationMin: 20,
          },
          {
            name: 'Thyroid Profile Total (T3, T4, TSH)',
            description: 'Assesses thyroid gland function and metabolic hormone levels.',
            category: 'Endocrinology',
            prepInstructions: 'Overnight fasting of 8-10 hours is recommended before blood draw.',
            price: 1200,
            durationMin: 15,
          },
          {
            name: 'Lipid Profile Comprehensive',
            description: 'Measures cholesterol levels, LDL, HDL, and triglycerides to evaluate cardiovascular risk.',
            category: 'Cardiology',
            prepInstructions: 'Strict 10-12 hour fasting required. Only water allowed.',
            price: 950,
            durationMin: 15,
          },
          {
            name: 'HbA1c Glycated Hemoglobin',
            description: 'Provides average blood sugar control over the past 2-3 months.',
            category: 'Diabetology',
            prepInstructions: 'Fasting not strictly required.',
            price: 800,
            durationMin: 15,
          },
        ],
      },
    },
    include: { tests: true },
  });

  const center2 = await prisma.diagnosticCenter.create({
    data: {
      name: 'Metropolis Precision Labs',
      location: '450 Healthcare Avenue, Downtown Centre',
      contactEmail: 'info@metropolislabs.com',
      contactPhone: '+1 (555) 876-5432',
      isActive: true,
      tests: {
        create: [
          {
            name: 'Liver Function Test (LFT)',
            description: 'Measures proteins, liver enzymes, and bilirubin to evaluate liver health.',
            category: 'Hepatology',
            prepInstructions: 'Fasting for 8 hours required. Avoid alcohol for 24 hours prior.',
            price: 1100,
            durationMin: 25,
          },
          {
            name: 'Kidney Function Test (KFT / RFT)',
            description: 'Evaluates renal clearance, creatinine, urea, and electrolyte balance.',
            category: 'Nephrology',
            prepInstructions: 'Maintain normal hydration. Fasting for 8 hours optional.',
            price: 1050,
            durationMin: 20,
          },
          {
            name: 'Vitamin D3 & B12 Combo',
            description: 'Screens for bone density risks, nerve function, and fatigue triggers.',
            category: 'Vitamin & Wellness',
            prepInstructions: 'Fasting preferred.',
            price: 1800,
            durationMin: 15,
          },
        ],
      },
    },
    include: { tests: true },
  });

  const cbcTest = center1.tests.find((t) => t.name.includes('CBC'));
  const thyroidTest = center1.tests.find((t) => t.name.includes('Thyroid'));
  const lftTest = center2.tests.find((t) => t.name.includes('Liver'));

  const booking1 = await prisma.booking.create({
    data: {
      userId: patientUser.id,
      testId: cbcTest.id,
      centerId: center1.id,
      appointmentDate: new Date(Date.now() + 86400000 * 2),
      amount: cbcTest.price,
      status: 'CONFIRMED',
      payment: {
        create: {
          amount: cbcTest.price,
          currency: 'INR',
          gatewayOrderId: 'order_EVE_88192301',
          gatewayPaymentId: 'pay_EVE_99210481',
          status: 'SUCCESS',
          events: {
            create: [
              { status: 'PENDING', payload: { step: 'order_created' } },
              { status: 'SUCCESS', payload: { step: 'payment_verified' } },
            ],
          },
        },
      },
    },
  });

  await prisma.webhookEvent.create({
    data: {
      eventId: 'evt_rzp_991823012',
      provider: 'razorpay',
      eventType: 'payment.captured',
      payloadHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      processingState: 'PROCESSED',
      retryCount: 0,
    },
  });

  await prisma.medicalReport.create({
    data: {
      userId: patientUser.id,
      testType: 'Liver Function Test (LFT)',
      fileUrl: 'https://evehealth-reports.s3.amazonaws.com/sample_lft_report_sarah_jenkins.pdf',
    },
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
