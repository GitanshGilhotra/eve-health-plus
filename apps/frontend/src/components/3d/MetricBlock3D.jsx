import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { soundFx } from '../../shared/soundFx';

export const MetricBlock3D = ({
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor = 'cyan', // 'cyan' | 'emerald' | 'indigo' | 'amber' | 'rose'
  badge,
  trend,
  onClick,
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 400, damping: 28 });
  const mouseYSpring = useSpring(y, { stiffness: 400, damping: 28 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['12deg', '-12deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-12deg', '12deg']);

  const colorStyles = {
    cyan: {
      border: 'hover:border-cyan-500/60',
      glow: 'hover:shadow-[0_20px_50px_-10px_rgba(6,182,212,0.3)]',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      badgeBg: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40',
      accentText: 'text-cyan-400',
      line: 'bg-gradient-to-r from-cyan-500 to-blue-500',
    },
    emerald: {
      border: 'hover:border-emerald-500/60',
      glow: 'hover:shadow-[0_20px_50px_-10px_rgba(16,185,129,0.3)]',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
      accentText: 'text-emerald-400',
      line: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    },
    indigo: {
      border: 'hover:border-indigo-500/60',
      glow: 'hover:shadow-[0_20px_50px_-10px_rgba(99,102,241,0.3)]',
      iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      badgeBg: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40',
      accentText: 'text-indigo-400',
      line: 'bg-gradient-to-r from-indigo-500 to-purple-500',
    },
    amber: {
      border: 'hover:border-amber-500/60',
      glow: 'hover:shadow-[0_20px_50px_-10px_rgba(245,158,11,0.3)]',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
      accentText: 'text-amber-400',
      line: 'bg-gradient-to-r from-amber-500 to-orange-500',
    },
  };

  const style = colorStyles[accentColor] || colorStyles.cyan;

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{
        rotateY,
        rotateX,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => {
        soundFx.playClick();
        if (onClick) onClick();
      }}
      className={`relative rounded-3xl p-6 bg-slate-900/75 backdrop-blur-2xl border border-white/10 ${style.border} ${style.glow} transition-all duration-300 cursor-pointer group overflow-hidden select-none`}
    >
      {/* 3D Top Lighting Accent Bevel */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${style.line} opacity-70 group-hover:opacity-100 transition-opacity`} />
      
      {/* Specular Glare Background */}
      <div className="absolute -top-20 -right-20 w-44 h-44 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all pointer-events-none" />

      {/* Layer 1: Header with Icon (translateZ: 35px) */}
      <div style={{ transform: 'translateZ(35px)' }} className="flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-wider text-slate-400 group-hover:text-slate-200 transition-colors">
          {title}
        </span>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${style.iconBg} shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-6`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {/* Layer 2: Big Value (translateZ: 50px) */}
      <div style={{ transform: 'translateZ(50px)' }} className="mt-4">
        <p className="text-3xl sm:text-4xl font-black text-white tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-cyan-200 transition-all">
          {value}
        </p>
      </div>

      {/* Layer 3: Subtitle & Badges (translateZ: 30px) */}
      <div style={{ transform: 'translateZ(30px)' }} className="mt-3 flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-white/5">
        <span className="text-xs text-slate-400 font-medium">
          {subtitle}
        </span>
        {badge && (
          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${style.badgeBg}`}>
            {badge}
          </span>
        )}
      </div>

      {/* 3D Isometric Edge Glow Indicator */}
      <div className="absolute bottom-1 right-2 w-8 h-8 rounded-full bg-cyan-500/10 blur-xl pointer-events-none group-hover:scale-150 transition-transform" />
    </motion.div>
  );
};
