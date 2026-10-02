import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Brain,
  Droplets,
  Activity,
  Shield,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  CalendarCheck
} from 'lucide-react';
import { soundFx } from '../../shared/soundFx';
import { useAppStore } from '../../store/useAppStore';

const systems = [
  {
    id: 'cardio',
    name: 'Cardiovascular',
    icon: Heart,
    color: 'rose',
    accent: '#f43f5e',
    status: 'Optimal (98%)',
    score: 98,
    metrics: [
      { label: 'Blood Pressure', value: '118/76', unit: 'mmHg', status: 'Normal' },
      { label: 'Resting Heart Rate', value: '72', unit: 'bpm', status: 'Optimal' },
      { label: 'Cardiac Troponin I', value: '< 0.01', unit: 'ng/mL', status: 'Negative' },
      { label: 'Arterial Elasticity', value: '96', unit: '%', status: 'Excellent' },
    ],
    recommendedTest: 'Lipid Profile Comprehensive',
    testCategory: 'Cardiology',
    insights: 'Low atherogenic risk. Arterial compliance remains within the 95th percentile for age group.',
  },
  {
    id: 'neuro',
    name: 'Neurological & Stress',
    icon: Brain,
    color: 'indigo',
    accent: '#6366f1',
    status: 'Balanced (92%)',
    score: 92,
    metrics: [
      { label: 'Cortisol (AM)', value: '14.2', unit: 'mcg/dL', status: 'Optimal' },
      { label: 'REM Sleep Efficiency', value: '88', unit: '%', status: 'Good' },
      { label: 'Cognitive Latency', value: '240', unit: 'ms', status: 'Fast' },
      { label: 'HRV (Stress Index)', value: '64', unit: 'ms', status: 'Stable' },
    ],
    recommendedTest: 'Vitamin D3 & B12 Combo',
    testCategory: 'Vitamin & Wellness',
    insights: 'Parasympathetic tone is well-recovered. Cortisol rhythm aligns with healthy circadian schedule.',
  },
  {
    id: 'metabolic',
    name: 'Metabolic & Thyroid',
    icon: Droplets,
    color: 'emerald',
    accent: '#10b981',
    status: 'Normal (95%)',
    score: 95,
    metrics: [
      { label: 'Fasting Glucose', value: '98', unit: 'mg/dL', status: 'Normal' },
      { label: 'HbA1c', value: '5.2', unit: '%', status: 'Normal' },
      { label: 'TSH Hormone', value: '1.85', unit: 'uIU/mL', status: 'Optimal' },
      { label: 'Insulin Sensitivity', value: '94', unit: '%', status: 'High' },
    ],
    recommendedTest: 'Thyroid Profile Total (T3, T4, TSH)',
    testCategory: 'Endocrinology',
    insights: 'Insulin sensitivity is primed. Zero indications of glycemic variability or insulin resistance.',
  },
  {
    id: 'cellular',
    name: 'Hematology & Immune',
    icon: Activity,
    color: 'cyan',
    accent: '#06b6d4',
    status: 'Peak (96%)',
    score: 96,
    metrics: [
      { label: 'Hemoglobin', value: '14.8', unit: 'g/dL', status: 'Optimal' },
      { label: 'Total Leukocytes', value: '6,400', unit: '/mcL', status: 'Normal' },
      { label: 'Platelet Count', value: '260,000', unit: '/mcL', status: 'Normal' },
      { label: 'hs-CRP (Inflammation)', value: '0.6', unit: 'mg/L', status: 'Low Risk' },
    ],
    recommendedTest: 'Complete Blood Count (CBC)',
    testCategory: 'Hematology',
    insights: 'Cellular oxygenation capacity is optimal. No active systemic inflammatory cascades detected.',
  },
];

export const InteractiveBiometricScanner3D = () => {
  const [selectedId, setSelectedId] = useState('cardio');
  const { openBookingModal, centers } = useAppStore();
  const currentSystem = systems.find((s) => s.id === selectedId) || systems[0];

  const handleSelect = (id) => {
    soundFx.playClick();
    setSelectedId(id);
  };

  const handleBookTest = () => {
    soundFx.playClick();
    if (centers.length > 0) {
      const match = centers[0].tests.find((t) => t.category === currentSystem.testCategory) || centers[0].tests[0];
      openBookingModal(centers[0], match);
    }
  };

  return (
    <div className="bento-card p-6 sm:p-8 overflow-hidden relative">
      {/* Dynamic Ambient Background Glow */}
      <div
        className="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: currentSystem.accent }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
              3D Bio-System Multi-Layer Matrix
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Interactive Diagnostic Telemetry
          </h2>
        </div>

        {/* System Selector 3D Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {systems.map((s) => {
            const Icon = s.icon;
            const isSelected = s.id === selectedId;
            return (
              <button
                key={s.id}
                onClick={() => handleSelect(s.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/40 scale-105'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/5 hover:border-white/20'
                }`}
              >
                <Icon className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                <span>{s.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content: 3D Telemetry Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSystem.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="pt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10"
        >
          {/* Left 2 Cols: 4 Live Metric Cubes */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {currentSystem.metrics.map((metric, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-900/80 border border-white/10 p-4 hover:border-cyan-500/40 transition-all group"
                  style={{ transform: 'perspective(800px)' }}
                >
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{metric.label}</span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      {metric.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-white group-hover:text-cyan-300 transition-colors">
                      {metric.value}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{metric.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Clinical Insights Bar */}
            <div className="rounded-2xl bg-slate-900/60 border border-white/5 p-4 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                  Automated Clinical Triangulation
                </span>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  {currentSystem.insights}
                </p>
              </div>
            </div>
          </div>

          {/* Right Col: 3D System Diagnostic Score & Action */}
          <div className="rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-cyan-500/30 p-6 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Integrity Score
                </span>
                <span className="text-xs font-bold text-emerald-400">
                  {currentSystem.status}
                </span>
              </div>

              <div className="my-5 text-center">
                <div className="relative inline-flex items-center justify-center">
                  {/* Circular Glow Ring */}
                  <div
                    className="w-28 h-28 rounded-full border-4 border-cyan-500/20 flex items-center justify-center relative"
                  >
                    <div
                      className="absolute inset-0 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin-slow"
                    />
                    <div className="text-center">
                      <span className="text-3xl font-black text-white">{currentSystem.score}</span>
                      <span className="block text-[10px] text-slate-400 uppercase font-mono">/ 100</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-center">
                <p className="text-xs font-bold text-white">Recommended Screening</p>
                <p className="text-xs text-cyan-300 font-mono">{currentSystem.recommendedTest}</p>
              </div>
            </div>

            <button
              onClick={handleBookTest}
              className="mt-6 w-full btn-primary !text-xs !py-3 flex items-center justify-center gap-2"
            >
              <CalendarCheck className="h-4 w-4" />
              <span>Lock Slot for Assay</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
