import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { formatDate } from '../shared/utils';
import {
  Building2,
  DollarSign,
  Users,
  Plus,
  TrendingUp,
  CheckCircle2,
  Clock,
  Activity,
  X,
  ShieldCheck,
  ChevronRight,
  PlusCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { soundFx } from '../shared/soundFx';

const testPopularityData = [
  { name: 'CBC Panel', bookings: 42 },
  { name: 'Thyroid T3/T4', bookings: 35 },
  { name: 'Lipid Profile', bookings: 28 },
  { name: 'Liver LFT', bookings: 21 },
  { name: 'Kidney KFT', bookings: 16 },
];

export const CenterAdminPage = () => {
  const { bookings, updateBookingStatus, centers } = useAppStore();
  const [showAddTestModal, setShowAddTestModal] = useState(false);
  const [newTestName, setNewTestName] = useState('');
  const [newTestPrice, setNewTestPrice] = useState('');

  const currentCenter = centers[0];

  const handleCreateTest = (e) => {
    e.preventDefault();
    if (!newTestName || !newTestPrice) return;
    soundFx.playClick();
    alert(`New Diagnostic Assay "${newTestName}" priced at ₹${newTestPrice} published for ${currentCenter?.name}.`);
    setShowAddTestModal(false);
    setNewTestName('');
    setNewTestPrice('');
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-full bg-amber-950/80 px-3 py-0.5 text-[10px] font-mono font-bold text-amber-300 border border-amber-500/30">
              OPERATIONS CONSOLE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <Building2 className="h-7 w-7 text-amber-400" />
            <span>{currentCenter?.name || 'Center Operations'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl leading-relaxed">
            Manage test catalog pricing, daily slot capacities, and appointment fulfillment queue.
          </p>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            setShowAddTestModal(true);
          }}
          className="btn-primary text-xs !py-3 !px-5 shrink-0"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add New Assay</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bento-card p-6">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Lab Revenue (MTD)</span>
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-black text-white tracking-tight">₹1,48,500</p>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+18.4% vs last cycle</span>
          </div>
        </div>

        <div className="bento-card p-6">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Slot Occupancy</span>
            <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-black text-white tracking-tight">88%</p>
          <div className="mt-2.5 text-xs text-slate-400 font-medium">
            <span>44 of 50 daily slots locked</span>
          </div>
        </div>

        <div className="bento-card p-6">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Completed Assays</span>
            <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-black text-white tracking-tight">142</p>
          <div className="mt-2.5 text-xs text-indigo-400 font-bold">
            <span>99.2% on-time turnaround</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Queue & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Bookings Queue (7 cols) */}
        <div className="lg:col-span-7 bento-card p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-white">Live Phlebotomy Queue</h2>
              <p className="text-xs text-slate-400 mt-0.5">{bookings.length} patients scheduled today</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
              Live Intake
            </span>
          </div>

          <div className="space-y-3.5">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-amber-500/40 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">{booking.test?.name}</span>
                    <span className="rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-3 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-amber-400" />
                      {formatDate(booking.appointmentDate)}
                    </span>
                    <span>• Ref: #{booking.id}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {booking.status !== 'COMPLETED' ? (
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        updateBookingStatus(booking.id, 'COMPLETED');
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900 border border-emerald-500/30 text-xs font-bold transition-all"
                    >
                      Complete Assay
                    </button>
                  ) : (
                    <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      Completed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Assays Chart (5 cols) */}
        <div className="lg:col-span-5 bento-card p-6 sm:p-7 space-y-5">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-base font-extrabold text-white">Assay Frequency</h2>
            <p className="text-xs text-slate-400 mt-0.5">Top requested tests by volume</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={testPopularityData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(5, 8, 17, 0.95)',
                    borderRadius: '1rem',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    fontSize: '12px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="bookings" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Add Test Modal */}
      {showAddTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-slate-950 border border-white/15 p-6 sm:p-8 shadow-2xl relative space-y-5">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h3 className="text-lg font-black text-white">Create Diagnostic Assay</h3>
              <button
                onClick={() => setShowAddTestModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-900 hover:text-white border border-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTest} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Assay Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ferritin & Iron Panel"
                  value={newTestName}
                  onChange={(e) => setNewTestName(e.target.value)}
                  className="input-premium text-xs !py-3 w-full"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Price (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 850"
                  value={newTestPrice}
                  onChange={(e) => setNewTestPrice(e.target.value)}
                  className="input-premium text-xs !py-3 w-full"
                />
              </div>

              <button type="submit" className="btn-primary w-full text-xs !py-3.5 font-bold mt-2">
                Publish Assay to Catalog
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
