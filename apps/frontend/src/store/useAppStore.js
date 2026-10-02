import { create } from 'zustand';

const mockCenters = [
  {
    id: 'center_1',
    name: 'Apollo Health Diagnostic Hub',
    location: '102 Tech Park Boulevard, Silicon Valley, CA',
    contactEmail: 'contact@apollodiagnostics.com',
    contactPhone: '+1 (555) 234-5678',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tests: [
      {
        id: 'test_cbc_1',
        centerId: 'center_1',
        name: 'Complete Blood Count (CBC)',
        description: 'Evaluates overall health and detects anemia, infection, and inflammation.',
        category: 'Hematology',
        prepInstructions: 'No fasting mandatory. Stay hydrated.',
        price: 650,
        durationMin: 20,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'test_thyroid_1',
        centerId: 'center_1',
        name: 'Thyroid Profile Total (T3, T4, TSH)',
        description: 'Assesses thyroid gland activity and metabolic regulation.',
        category: 'Endocrinology',
        prepInstructions: 'Overnight fasting of 8-10 hours recommended.',
        price: 1200,
        durationMin: 15,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'test_lipid_1',
        centerId: 'center_1',
        name: 'Lipid Profile Comprehensive',
        description: 'Measures HDL, LDL, VLDL, and total cholesterol to assess cardiovascular risk.',
        category: 'Cardiology',
        prepInstructions: 'Strict 10-12 hour fasting required. Only water allowed.',
        price: 950,
        durationMin: 15,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'center_2',
    name: 'Metropolis Precision Labs',
    location: '450 Healthcare Avenue, Downtown Centre',
    contactEmail: 'info@metropolislabs.com',
    contactPhone: '+1 (555) 876-5432',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tests: [
      {
        id: 'test_lft_2',
        centerId: 'center_2',
        name: 'Liver Function Test (LFT)',
        description: 'Evaluates liver enzymes (ALT, AST), bilirubin, and serum proteins.',
        category: 'Hepatology',
        prepInstructions: '8-hour fasting required. Avoid alcohol for 24 hours.',
        price: 1100,
        durationMin: 25,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'test_kft_2',
        centerId: 'center_2',
        name: 'Kidney Function Test (KFT / RFT)',
        description: 'Measures blood urea, serum creatinine, and electrolyte balance.',
        category: 'Nephrology',
        prepInstructions: 'Normal hydration required.',
        price: 1050,
        durationMin: 20,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'test_vit_2',
        centerId: 'center_2',
        name: 'Vitamin D3 & B12 Combo',
        description: 'Screens for bone mineralization and peripheral neuropathy risks.',
        category: 'Vitamin & Wellness',
        prepInstructions: 'Fasting preferred.',
        price: 1800,
        durationMin: 15,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  },
];

const mockBookings = [
  {
    id: 'bk_1001',
    userId: 'user_patient_sarah_01',
    testId: 'test_cbc_1',
    centerId: 'center_1',
    appointmentDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    amount: 650,
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    center: mockCenters[0],
    test: mockCenters[0].tests[0],
    payment: {
      id: 'pay_1001',
      bookingId: 'bk_1001',
      amount: 650,
      currency: 'INR',
      gatewayOrderId: 'order_EVE_88192301',
      gatewayPaymentId: 'pay_EVE_99210481',
      status: 'SUCCESS',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  {
    id: 'bk_1002',
    userId: 'user_patient_sarah_01',
    testId: 'test_thyroid_1',
    centerId: 'center_1',
    appointmentDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    amount: 1200,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    center: mockCenters[0],
    test: mockCenters[0].tests[1],
    payment: {
      id: 'pay_1002',
      bookingId: 'bk_1002',
      amount: 1200,
      currency: 'INR',
      gatewayOrderId: 'order_EVE_77341209',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  {
    id: 'bk_1003',
    userId: 'user_patient_sarah_01',
    testId: 'test_lft_2',
    centerId: 'center_2',
    appointmentDate: new Date(Date.now() - 86400000 * 4).toISOString(),
    amount: 1100,
    status: 'COMPLETED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    center: mockCenters[1],
    test: mockCenters[1].tests[0],
    payment: {
      id: 'pay_1003',
      bookingId: 'bk_1003',
      amount: 1100,
      currency: 'INR',
      gatewayOrderId: 'order_EVE_55410982',
      gatewayPaymentId: 'pay_EVE_33410928',
      status: 'SUCCESS',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
];

const mockWebhooks = [
  {
    id: 'wh_01',
    eventId: 'evt_rzp_991823012',
    provider: 'razorpay',
    eventType: 'payment.captured',
    payloadHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    processingState: 'PROCESSED',
    retryCount: 0,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'wh_02',
    eventId: 'evt_rzp_774109281',
    provider: 'razorpay',
    eventType: 'payment.failed',
    payloadHash: '4a8b1c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b112',
    processingState: 'PROCESSED',
    retryCount: 0,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

const getSavedTheme = () => {
  try {
    return localStorage.getItem('appTheme') || 'obsidian';
  } catch (e) {
    return 'obsidian';
  }
};

export const useAppStore = create((set) => ({
  centers: mockCenters,
  bookings: mockBookings,
  webhooks: mockWebhooks,
  theme: getSavedTheme(), // 'obsidian' | 'emerald' | 'amethyst'
  setTheme: (theme) => {
    try {
      localStorage.setItem('appTheme', theme);
      if (typeof document !== 'undefined') {
        document.documentElement.className = `theme-${theme}`;
        document.body.className = `theme-${theme}`;
      }
    } catch (e) {}
    set({ theme });
  },
  isAuthModalOpen: false,
  authModalRole: 'PATIENT',
  authModalTab: 'LOGIN',
  openAuthModal: (role = 'PATIENT', tab = 'LOGIN') =>
    set({ isAuthModalOpen: true, authModalRole: role, authModalTab: tab }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  selectedCenter: null,
  selectedTest: null,
  isBookingModalOpen: false,
  isCommandPaletteOpen: false,
  activeTab: 'dashboard',
  searchQuery: '',
  setCenters: (centers) => set({ centers }),
  setBookings: (bookings) => set({ bookings }),
  openBookingModal: (center, test) => set({ selectedCenter: center, selectedTest: test, isBookingModalOpen: true }),
  closeBookingModal: () => set({ isBookingModalOpen: false, selectedCenter: null, selectedTest: null }),
  pendingCheckoutBooking: null,
  setPendingCheckoutBooking: (booking) => set({ pendingCheckoutBooking: booking }),
  setCommandPaletteOpen: (isOpen) => set({ isCommandPaletteOpen: isOpen }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  addBooking: (newBooking) => set((state) => ({ bookings: [newBooking, ...state.bookings] })),
  updateBookingStatus: (id, status) =>
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id ? { ...b, status, payment: b.payment ? { ...b.payment, status: status === 'CONFIRMED' ? 'SUCCESS' : b.payment.status } : undefined } : b
      ),
    })),
}));

