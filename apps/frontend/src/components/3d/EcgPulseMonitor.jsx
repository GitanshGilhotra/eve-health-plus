import React, { useState, useEffect } from 'react';
import { Activity, Heart, Volume2, VolumeX, Radio } from 'lucide-react';
import { soundFx } from '../../shared/soundFx';

export const EcgPulseMonitor = () => {
  const [bpm, setBpm] = useState(72);
  const [isMuted, setIsMuted] = useState(soundFx.isMuted);
  const [isPulsePeak, setIsPulsePeak] = useState(false);

  useEffect(() => {
    // Pulse cycle
    const interval = setInterval(() => {
      setIsPulsePeak(true);
      if (!isMuted) {
        soundFx.playBeep();
      }
      setTimeout(() => setIsPulsePeak(false), 200);
    }, (60 / bpm) * 1000);

    return () => clearInterval(interval);
  }, [bpm, isMuted]);

  const toggleSound = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="relative rounded-2xl bg-slate-950/80 border border-cyan-500/30 p-3 flex items-center justify-between gap-4 backdrop-blur-xl shadow-lg shadow-cyan-950/40 overflow-hidden">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.06)_1px,transparent_1px)] bg-[size:12px_12px] pointer-events-none" />

      {/* Heart Rate Stats */}
      <div className="flex items-center gap-3 relative z-10">
        <div className={`relative flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 transition-transform ${isPulsePeak ? 'scale-110 shadow-lg shadow-rose-500/30' : ''}`}>
          <Heart className={`h-5 w-5 ${isPulsePeak ? 'fill-rose-500 text-rose-500' : ''}`} />
          {isPulsePeak && (
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
          )}
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-black text-white">{bpm}</span>
            <span className="text-[10px] uppercase font-bold text-slate-400">BPM</span>
          </div>
          <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Sinus Rhythm Normal
          </p>
        </div>
      </div>

      {/* Animated Glowing ECG SVG Wave */}
      <div className="flex-1 max-w-[180px] sm:max-w-[240px] h-8 relative overflow-hidden hidden sm:block">
        <svg className="w-full h-full" viewBox="0 0 200 40" fill="none">
          <path
            d="M0 20 L40 20 L50 20 L55 5 L65 35 L75 10 L80 25 L85 20 L130 20 L135 5 L145 35 L155 10 L160 25 L165 20 L200 20"
            stroke="rgba(6, 182, 212, 0.2)"
            strokeWidth="1.5"
          />
          <path
            className="ecg-path"
            d="M0 20 L40 20 L50 20 L55 5 L65 35 L75 10 L80 25 L85 20 L130 20 L135 5 L145 35 L155 10 L160 25 L165 20 L200 20"
            stroke="#06b6d4"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="drop-shadow(0 0 6px rgba(6, 182, 212, 0.8))"
          />
        </svg>
      </div>

      {/* Sound Toggle */}
      <button
        onClick={toggleSound}
        className="p-2 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-300 transition-all text-xs flex items-center gap-1 shrink-0"
        title={isMuted ? 'Unmute Audio Pulse' : 'Mute Audio Pulse'}
      >
        {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />}
      </button>
    </div>
  );
};
