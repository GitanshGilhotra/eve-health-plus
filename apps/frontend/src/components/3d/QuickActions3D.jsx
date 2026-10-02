import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Zap,
  Building2,
  FileText,
  Radio,
  Server,
  ChevronRight,
  ShieldCheck,
  CalendarCheck
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { soundFx } from '../../shared/soundFx';

export const QuickActions3D = () => {
  const { setActiveTab, openBookingModal, centers } = useAppStore();

  const actions = [
    {
      id: 'ai',
      title: 'AI Clinical Triage',
      desc: 'LangChain symptom analysis',
      icon: Sparkles,
      gradient: 'from-cyan-500/20 to-blue-500/10',
      border: 'hover:border-cyan-400',
      textColor: 'text-cyan-400',
      onClick: () => setActiveTab('ai-assistant'),
    },
    {
      id: 'slot',
      title: 'Atomic Slot Lock',
      desc: 'Redis concurrency engine',
      icon: Zap,
      gradient: 'from-indigo-500/20 to-purple-500/10',
      border: 'hover:border-indigo-400',
      textColor: 'text-indigo-400',
      onClick: () => {
        if (centers.length > 0) {
          openBookingModal(centers[0], centers[0].tests[0]);
        }
      },
    },
    {
      id: 'labs',
      title: 'Partner Pathology',
      desc: 'NABL ISO 15189 Centers',
      icon: Building2,
      gradient: 'from-emerald-500/20 to-teal-500/10',
      border: 'hover:border-emerald-400',
      textColor: 'text-emerald-400',
      onClick: () => setActiveTab('centers'),
    },
    {
      id: 'reports',
      title: 'Encrypted Vault',
      desc: 'AES-256 PDF OCR Reports',
      icon: FileText,
      gradient: 'from-purple-500/20 to-pink-500/10',
      border: 'hover:border-purple-400',
      textColor: 'text-purple-400',
      onClick: () => setActiveTab('reports'),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <motion.div
            key={act.id}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              soundFx.playClick();
              act.onClick();
            }}
            className={`rounded-2xl p-4.5 bg-slate-900/80 backdrop-blur-xl border border-white/10 ${act.border} transition-all duration-200 cursor-pointer shadow-lg hover:shadow-cyan-500/15 relative overflow-hidden group select-none`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${act.gradient} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />

            <div className="flex items-center justify-between relative z-10">
              <div className={`p-2.5 rounded-xl bg-slate-800/80 border border-white/10 ${act.textColor} group-hover:scale-110 transition-transform`}>
                <Icon className="h-5 w-5" />
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>

            <div className="mt-3 relative z-10">
              <h3 className="text-sm font-black text-white group-hover:text-cyan-300 transition-colors">
                {act.title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 font-normal">
                {act.desc}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
