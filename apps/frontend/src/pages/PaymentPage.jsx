import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { formatCurrency, formatDate } from '../shared/utils';
import { soundFx } from '../shared/soundFx';
import {
  QrCode,
  CreditCard,
  Building,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Copy,
  Check,
  Download,
  ArrowLeft,
  RefreshCw,
  Lock,
  Receipt,
  FileCheck,
  Building2,
  ExternalLink,
  ChevronRight,
  Shield
} from 'lucide-react';

export const PaymentPage = () => {
  const {
    bookings,
    updateBookingStatus,
    setActiveTab,
    pendingCheckoutBooking,
    setPendingCheckoutBooking,
    addBooking
  } = useAppStore();
  const { user } = useAuthStore();

  const pendingBookings = bookings.filter((b) => b.status === 'PENDING');
  const [selectedBookingId, setSelectedBookingId] = useState(
    pendingCheckoutBooking ? pendingCheckoutBooking.id : (pendingBookings[0]?.id || bookings[0]?.id || 'custom')
  );

  const currentBooking = pendingCheckoutBooking || bookings.find((b) => b.id === selectedBookingId);
  const payableAmount = currentBooking ? currentBooking.amount : 1200;

  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' | 'CARD' | 'NETBANKING'
  const [timeLeft, setTimeLeft] = useState(600); // 10 mins
  const [isCopied, setIsCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [selectedBank, setSelectedBank] = useState('HDFC');

  // Professional Card Fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState(user ? `${user.firstName} ${user.lastName}` : '');

  const upiId = 'evehealth.payments@icici';

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyUPI = () => {
    soundFx.playClick();
    navigator.clipboard.writeText(upiId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSimulatePayment = (methodUsed = 'UPI') => {
    soundFx.playClick();
    setIsProcessing(true);
    setProcessStep('Connecting to NPCI Clearing Switch...');

    setTimeout(() => {
      setProcessStep('Verifying Payment Authorization...');
      setTimeout(() => {
        setProcessStep('Confirming Diagnostic Slot Reservation...');
        setTimeout(() => {
          setIsProcessing(false);
          soundFx.playSuccess();

          const txnId = `UPI${Math.floor(100000000000 + Math.random() * 900000000000)}`;
          const orderId = `ORD_EVE_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

          if (currentBooking) {
            const exists = bookings.some((b) => b.id === currentBooking.id);
            if (exists) {
              updateBookingStatus(currentBooking.id, 'CONFIRMED');
            } else {
              addBooking({
                ...currentBooking,
                status: 'CONFIRMED',
                payment: {
                  id: `pay_${Math.random().toString(36).substring(2, 8)}`,
                  bookingId: currentBooking.id,
                  amount: payableAmount,
                  currency: 'INR',
                  gatewayOrderId: orderId,
                  gatewayPaymentId: txnId,
                  status: 'SUCCESS',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
              });
            }
          }

          setPaymentSuccess({
            txnId,
            orderId,
            amount: payableAmount,
            method: methodUsed,
            timestamp: new Date().toISOString(),
            booking: currentBooking,
          });
        }, 600);
      }, 700);
    }, 800);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundFx.playClick();
              setPendingCheckoutBooking(null);
              setActiveTab('centers');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back</span>
          </button>
          <div className="h-4 w-px bg-slate-800 hidden sm:block" />
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Checkout & Settlement</h1>
            <p className="text-xs text-slate-400">Complete payment to finalize your diagnostic appointment slot.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
            <Lock className="h-3 w-3 text-emerald-400" />
            <span>256-Bit Encrypted</span>
          </div>
        </div>
      </div>

      {/* Main Checkout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Order Invoice & Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                Order Summary
              </span>
              <span className="text-xs font-mono text-cyan-400 font-bold">
                REF #{currentBooking?.id || 'BK-NEW'}
              </span>
            </div>

            {/* Test Details */}
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {currentBooking?.test?.category || 'Clinical Assay'}
                </span>
                <h3 className="text-base font-bold text-white mt-1.5">
                  {currentBooking?.test?.name || 'Diagnostic Blood Profile'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {currentBooking?.center?.name || 'Metropolis Precision Diagnostics'}
                </p>
              </div>

              {currentBooking?.appointmentDate && (
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Scheduled Slot:</span>
                    <span className="text-white font-medium">{formatDate(currentBooking.appointmentDate)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Sample Collection:</span>
                    <span className="text-emerald-400 font-medium">Home Phlebotomy</span>
                  </div>
                </div>
              )}
            </div>

            {/* Transparent Bill Breakdown */}
            <div className="pt-3 border-t border-slate-800 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Diagnostic Assay Fee</span>
                <span className="text-slate-200 font-mono">{formatCurrency(payableAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Phlebotomy & Kit Preparation</span>
                <span className="text-emerald-400 font-medium">FREE</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Healthcare Exemption GST</span>
                <span className="text-slate-200 font-mono">₹0.00</span>
              </div>
              <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-sm font-bold">
                <span className="text-white">Total Amount Due</span>
                <span className="text-xl font-extrabold text-white font-mono">
                  {formatCurrency(payableAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Security & Compliance Badges */}
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2 text-slate-300 font-semibold">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Certified Healthcare Payment Gateway</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Payments are held in escrow and settled directly upon laboratory appointment verification. ISO 27001 & HIPAA data compliance assured.
            </p>
          </div>
        </div>

        {/* Right Column: Payment Methods & QR Code (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Payment Method Selector */}
          <div className="flex gap-2 p-1 bg-slate-900/80 border border-slate-800 rounded-2xl">
            <button
              onClick={() => {
                soundFx.playClick();
                setPaymentMethod('UPI');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                paymentMethod === 'UPI'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <QrCode className="h-3.5 w-3.5 text-cyan-400" />
              <span>UPI / BharatQR</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                setPaymentMethod('CARD');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                paymentMethod === 'CARD'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="h-3.5 w-3.5 text-slate-400" />
              <span>Credit / Debit Card</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                setPaymentMethod('NETBANKING');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                paymentMethod === 'NETBANKING'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building className="h-3.5 w-3.5 text-slate-400" />
              <span>Net Banking</span>
            </button>
          </div>

          {/* TAB 1: UPI QR CODE (CLEAN FINTECH DESIGN) */}
          {paymentMethod === 'UPI' && (
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-7 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white">Scan UPI QR with any Mobile App</h3>
                  <p className="text-xs text-slate-400">Google Pay, PhonePe, Paytm, BHIM, CRED or Banking Apps</p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-400 self-start sm:self-auto">
                  <Clock className="h-3 w-3" />
                  <span>Expires in {formatTimer(timeLeft)}</span>
                </div>
              </div>

              {/* High-Resolution Fintech QR Canvas */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-2">
                {/* QR Box */}
                <div className="relative p-4 bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center shrink-0">
                  {/* Clean SVG Precision QR Matrix */}
                  <svg
                    viewBox="0 0 160 160"
                    className="w-48 h-48 select-none"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Top-Left Finder */}
                    <rect x="12" y="12" width="36" height="36" rx="6" fill="#0f172a" />
                    <rect x="18" y="18" width="24" height="24" rx="4" fill="white" />
                    <rect x="24" y="24" width="12" height="12" rx="2" fill="#0f172a" />

                    {/* Top-Right Finder */}
                    <rect x="112" y="12" width="36" height="36" rx="6" fill="#0f172a" />
                    <rect x="118" y="18" width="24" height="24" rx="4" fill="white" />
                    <rect x="124" y="24" width="12" height="12" rx="2" fill="#0f172a" />

                    {/* Bottom-Left Finder */}
                    <rect x="12" y="112" width="36" height="36" rx="6" fill="#0f172a" />
                    <rect x="18" y="118" width="24" height="24" rx="4" fill="white" />
                    <rect x="24" y="124" width="12" height="12" rx="2" fill="#0f172a" />

                    {/* Precision Data Matrix Grid */}
                    <g fill="#0f172a">
                      <rect x="56" y="14" width="6" height="6" rx="1.5" />
                      <rect x="68" y="14" width="6" height="6" rx="1.5" />
                      <rect x="80" y="14" width="6" height="6" rx="1.5" />
                      <rect x="92" y="14" width="6" height="6" rx="1.5" />

                      <rect x="56" y="26" width="6" height="6" rx="1.5" />
                      <rect x="74" y="26" width="12" height="6" rx="1.5" />
                      <rect x="92" y="26" width="6" height="6" rx="1.5" />

                      <rect x="56" y="38" width="12" height="6" rx="1.5" />
                      <rect x="86" y="38" width="6" height="6" rx="1.5" />

                      <rect x="14" y="56" width="6" height="6" rx="1.5" />
                      <rect x="26" y="56" width="12" height="6" rx="1.5" />
                      <rect x="44" y="56" width="6" height="6" rx="1.5" />
                      <rect x="110" y="56" width="14" height="6" rx="1.5" />
                      <rect x="130" y="56" width="16" height="6" rx="1.5" />

                      <rect x="14" y="68" width="18" height="6" rx="1.5" />
                      <rect x="38" y="68" width="12" height="6" rx="1.5" />
                      <rect x="110" y="68" width="6" height="6" rx="1.5" />
                      <rect x="126" y="68" width="12" height="6" rx="1.5" />

                      <rect x="14" y="80" width="6" height="6" rx="1.5" />
                      <rect x="26" y="80" width="6" height="6" rx="1.5" />
                      <rect x="42" y="80" width="12" height="6" rx="1.5" />
                      <rect x="106" y="80" width="18" height="6" rx="1.5" />
                      <rect x="134" y="80" width="12" height="6" rx="1.5" />

                      <rect x="14" y="92" width="14" height="6" rx="1.5" />
                      <rect x="36" y="92" width="18" height="6" rx="1.5" />
                      <rect x="110" y="92" width="12" height="6" rx="1.5" />
                      <rect x="130" y="92" width="16" height="6" rx="1.5" />

                      <rect x="56" y="112" width="8" height="6" rx="1.5" />
                      <rect x="72" y="112" width="14" height="6" rx="1.5" />
                      <rect x="94" y="112" width="10" height="6" rx="1.5" />
                      <rect x="112" y="112" width="6" height="6" rx="1.5" />
                      <rect x="126" y="112" width="12" height="6" rx="1.5" />

                      <rect x="56" y="126" width="14" height="6" rx="1.5" />
                      <rect x="80" y="126" width="6" height="6" rx="1.5" />
                      <rect x="94" y="126" width="14" height="6" rx="1.5" />
                      <rect x="120" y="126" width="8" height="6" rx="1.5" />
                      <rect x="136" y="126" width="12" height="6" rx="1.5" />

                      <rect x="56" y="138" width="6" height="6" rx="1.5" />
                      <rect x="70" y="138" width="18" height="6" rx="1.5" />
                      <rect x="112" y="138" width="16" height="6" rx="1.5" />
                      <rect x="138" y="138" width="10" height="6" rx="1.5" />
                    </g>

                    {/* NPCI Verified Center Badge */}
                    <circle cx="80" cy="80" r="16" fill="#0f172a" />
                    <circle cx="80" cy="80" r="14" fill="#0284c7" />
                    <path d="M74 80L78 84L86 76" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>

                  <div className="mt-2 text-center">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                      NPCI • BHARAT QR
                    </span>
                  </div>
                </div>

                {/* Instructions & VPA Copy */}
                <div className="space-y-4 text-center sm:text-left">
                  <div>
                    <span className="text-xs font-mono text-slate-400">Total Scan Amount</span>
                    <div className="text-2xl font-black text-white font-mono">
                      {formatCurrency(payableAmount)}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-slate-400">Or Pay via UPI VPA / ID:</p>
                    <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs">
                      <span className="font-mono text-cyan-300 font-semibold">{upiId}</span>
                      <button
                        onClick={handleCopyUPI}
                        className="ml-auto text-slate-400 hover:text-white transition-colors"
                        title="Copy UPI ID"
                      >
                        {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-1">
                    <p className="text-[11px] text-slate-500">
                      Zero convenience charge. Appointment slot confirms automatically within 2 seconds of payment.
                    </p>
                  </div>
                </div>
              </div>

              {/* Primary Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => handleSimulatePayment('UPI')}
                  disabled={isProcessing}
                  className="w-full py-3.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>{processStep}</span>
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4" />
                      <span>Simulate Mobile Scan & Confirm Payment</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CREDIT / DEBIT CARDS (STRIPE-GRADE MINIMALIST DESIGN) */}
          {paymentMethod === 'CARD' && (
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-7 space-y-5">
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white">Credit or Debit Card</h3>
                <div className="flex gap-2 text-xs text-slate-500 font-mono font-bold">
                  <span>VISA</span>
                  <span>•</span>
                  <span>MASTERCARD</span>
                  <span>•</span>
                  <span>RUPAY</span>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1.5">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 •••• •••• 4242"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1.5">Expiration (MM/YY)</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM / YY"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1.5">CVC / CVV</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="•••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1.5">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Sarah Jenkins"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => handleSimulatePayment('CARD')}
                  disabled={isProcessing}
                  className="w-full py-3.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>{processStep}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      <span>Pay {formatCurrency(payableAmount)} Securely</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: NETBANKING */}
          {paymentMethod === 'NETBANKING' && (
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-7 space-y-5">
              <div className="pb-4 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white">Select NetBanking Institution</h3>
                <p className="text-xs text-slate-400">Direct instant debit clearance</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { id: 'HDFC', name: 'HDFC Bank' },
                  { id: 'ICICI', name: 'ICICI Bank' },
                  { id: 'SBI', name: 'State Bank of India' },
                  { id: 'AXIS', name: 'Axis Bank' },
                  { id: 'KOTAK', name: 'Kotak Bank' },
                  { id: 'PNB', name: 'Punjab National' },
                ].map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedBank(b.id);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedBank === b.id
                        ? 'bg-slate-800 border-cyan-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <p className="text-xs font-bold">{b.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Instant Clear</p>
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => handleSimulatePayment('NETBANKING')}
                  disabled={isProcessing}
                  className="w-full py-3.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>{processStep}</span>
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4" />
                      <span>Continue with {selectedBank} Gateway</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success Modal (Corporate Tax Invoice Style) */}
      {paymentSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-slate-950 border border-slate-800 p-6 shadow-2xl space-y-5 text-center relative">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                Payment Authorized
              </span>
              <h2 className="text-lg font-bold text-white mt-1">Appointment Slot Confirmed</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Your diagnostic order has been registered in the lab information system.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs space-y-2 text-left font-mono">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Amount Settled:</span>
                <span className="font-bold text-white">{formatCurrency(paymentSuccess.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Transaction ID:</span>
                <span className="text-slate-200 select-all">{paymentSuccess.txnId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Order ID:</span>
                <span className="text-slate-200 select-all">{paymentSuccess.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Channel:</span>
                <span className="text-slate-200">{paymentSuccess.method}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  soundFx.playClick();
                  window.print();
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => {
                  soundFx.playClick();
                  setPaymentSuccess(null);
                  setPendingCheckoutBooking(null);
                  setActiveTab('bookings');
                }}
                className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold tracking-wide transition-all shadow-md shadow-cyan-500/20"
              >
                View in Bookings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
