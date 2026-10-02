import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { formatCurrency } from '../shared/utils';
import {
  X,
  Clock,
  Building2,
  AlertCircle,
  Loader2,
  Lock,
  Calendar,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { soundFx } from '../shared/soundFx';

export const BookingModal = () => {
  const {
    isBookingModalOpen,
    closeBookingModal,
    selectedCenter,
    selectedTest,
    setActiveTab,
    setPendingCheckoutBooking
  } = useAppStore();
  const { user } = useAuthStore();

  const [selectedDate, setSelectedDate] = useState('2026-10-02');
  const [selectedTime, setSelectedTime] = useState('09:30 AM');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lockStatus, setLockStatus] = useState(null);

  if (!isBookingModalOpen || !selectedCenter || !selectedTest) return null;

  const handleAcquireSlotAndPay = () => {
    soundFx.playClick();
    setIsProcessing(true);
    setLockStatus('Acquiring Redis Distributed Lock for appointment slot...');

    setTimeout(() => {
      setLockStatus('Slot Locked! Navigating to Payment Terminal...');

      const newBooking = {
        id: `bk_${Math.random().toString(36).substring(2, 8)}`,
        userId: user?.id || 'user_1',
        testId: selectedTest.id,
        centerId: selectedCenter.id,
        appointmentDate: `${selectedDate}T${selectedTime === '09:30 AM' ? '09:30:00' : '11:00:00'}Z`,
        amount: selectedTest.price,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        center: selectedCenter,
        test: selectedTest,
        payment: {
          id: `pay_${Math.random().toString(36).substring(2, 8)}`,
          bookingId: `bk_new`,
          amount: selectedTest.price,
          currency: 'INR',
          gatewayOrderId: `ORD_EVE_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      setTimeout(() => {
        setIsProcessing(false);
        setPendingCheckoutBooking(newBooking);
        closeBookingModal();
        setActiveTab('payment-checkout');
      }, 600);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-slate-950 border border-slate-800 p-6 shadow-2xl relative space-y-5">
        {/* Close Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            closeBookingModal();
          }}
          className="absolute right-5 top-5 rounded-xl p-1.5 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800 shrink-0">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0 pr-8">
            <h3 className="text-base font-bold text-white truncate">Schedule Laboratory Slot</h3>
            <p className="text-xs text-slate-400 truncate">{selectedCenter.name}</p>
          </div>
        </div>

        {/* Test Summary Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <span className="rounded bg-cyan-950 px-2 py-0.5 text-[10px] font-mono font-bold text-cyan-300 border border-cyan-800">
                {selectedTest.category || 'General Wellness'}
              </span>
              <h4 className="mt-1.5 text-sm font-bold text-white">{selectedTest.name}</h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{selectedTest.description}</p>
            </div>
            <span className="text-base font-bold text-white font-mono shrink-0 pl-3">
              {formatCurrency(selectedTest.price)}
            </span>
          </div>

          {selectedTest.prepInstructions && (
            <div className="mt-2 flex items-start gap-2 rounded-lg bg-amber-950/40 p-2.5 text-xs text-amber-300 border border-amber-800/60">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
              <span>{selectedTest.prepInstructions}</span>
            </div>
          )}
        </div>

        {/* Date Selector */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">Select Appointment Date</label>
          <div className="grid grid-cols-4 gap-2">
            {['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'].map((date) => (
              <button
                key={date}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedDate(date);
                }}
                className={`py-2 px-1 rounded-xl border text-xs font-medium transition-all text-center ${
                  selectedDate === date
                    ? 'border-cyan-500 bg-cyan-950/60 text-white font-bold ring-1 ring-cyan-500'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                {date.substring(5)}
              </button>
            ))}
          </div>
        </div>

        {/* Time Slot Selector */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Select Time Slot (Protected by Redis Lock)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['08:30 AM', '09:30 AM', '11:00 AM', '02:00 PM', '04:30 PM'].map((time) => (
              <button
                key={time}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedTime(time);
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-xs font-medium transition-all ${
                  selectedTime === time
                    ? 'border-cyan-500 bg-cyan-950/60 text-white font-bold ring-1 ring-cyan-500'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <Clock className="h-3 w-3" />
                <span>{time}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Lock Status Indicator */}
        {lockStatus && (
          <div className="flex items-center gap-2 rounded-xl bg-cyan-950/60 p-2.5 text-xs text-cyan-300 border border-cyan-800/80 animate-pulse">
            <Lock className="h-3.5 w-3.5 animate-spin" />
            <span>{lockStatus}</span>
          </div>
        )}

        {/* Submit Action */}
        <button
          onClick={handleAcquireSlotAndPay}
          disabled={isProcessing}
          className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Locking Slot...</span>
            </>
          ) : (
            <>
              <Lock className="h-3.5 w-3.5" />
              <span>Lock Slot & Proceed to Checkout</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
