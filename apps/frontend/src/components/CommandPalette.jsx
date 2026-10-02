import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Search, Bot, Building2, CalendarCheck, FileText, X, Sparkles, ArrowRight, QrCode } from 'lucide-react';
import { soundFx } from '../shared/soundFx';

export const CommandPalette = () => {
  const { isCommandPaletteOpen, setCommandPaletteOpen, setActiveTab } = useAppStore();
  const [search, setSearch] = useState('');

  if (!isCommandPaletteOpen) return null;

  const handleSelect = (tabId) => {
    soundFx.playClick();
    setActiveTab(tabId);
    setCommandPaletteOpen(false);
  };

  const quickActions = [
    {
      id: 'ai-assistant',
      icon: Bot,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
      title: 'Launch AI Symptom Pre-Triage',
      desc: 'Describe symptoms to get instant differential diagnostic recommendations',
    },
    {
      id: 'centers',
      icon: Building2,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      title: 'Browse Diagnostic Centers & Assays',
      desc: 'View accredited partner pathology labs, test catalogs, and slot locks',
    },
    {
      id: 'bookings',
      icon: CalendarCheck,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      title: 'My Bookings & Slot Lock Telemetry',
      desc: 'Manage appointment reservations and simulate payment webhooks',
    },
    {
      id: 'payment-checkout',
      icon: QrCode,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      title: 'UPI 2.0 & QR Code Payments Terminal',
      desc: 'Scan dynamic UPI QR code, pay via cards/netbanking, and view receipts',
    },
    {
      id: 'reports',
      icon: FileText,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      title: 'Access Verified PDF Lab Reports',
      desc: 'Download digitally signed lab reports with OCR biomarker metrics',
    },
  ];

  const filteredActions = quickActions.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/75 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-slate-950 border border-white/15 p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-3 flex-1">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search tests, centers, AI engine, or navigate pages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-slate-500 font-medium"
              autoFocus
            />
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              setCommandPaletteOpen(false);
            }}
            className="rounded-xl p-1 text-slate-400 hover:bg-slate-900 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          <div>
            <p className="text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-widest px-2 mb-2">
              Command Palette Navigation
            </p>
            <div className="space-y-1.5">
              {filteredActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => handleSelect(action.id)}
                    className="flex w-full items-center justify-between rounded-2xl p-3 text-xs text-slate-300 hover:bg-slate-900 transition-all text-left group border border-transparent hover:border-cyan-500/40"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 ${action.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-white group-hover:text-cyan-300 transition-colors">{action.title}</p>
                        <p className="text-[11px] text-slate-400 font-normal">{action.desc}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
