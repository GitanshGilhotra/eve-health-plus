import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Zap,
  BrainCircuit,
  Building2,
  ShieldCheck,
  Heart,
  TrendingUp,
  RotateCw,
  Sparkles,
  Eye
} from 'lucide-react';
import { soundFx } from '../../shared/soundFx';

export const InteractiveHoloCube = ({ onActionClick }) => {
  const [rotX, setRotX] = useState(-15);
  const [rotY, setRotY] = useState(25);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [activeFace, setActiveFace] = useState('front');
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, rotX: -15, rotY: 25 });

  // Auto rotation loop
  useEffect(() => {
    if (!isAutoRotating || isDragging) return;
    const interval = setInterval(() => {
      setRotY((prev) => (prev + 0.6) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, [isAutoRotating, isDragging]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setIsAutoRotating(false);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rotX,
      rotY
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    setRotY(dragStartRef.current.rotY + deltaX * 0.5);
    setRotX(Math.max(-60, Math.min(60, dragStartRef.current.rotX - deltaY * 0.5)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const snapToFace = (face, targetX, targetY) => {
    soundFx.playClick();
    setIsAutoRotating(false);
    setActiveFace(face);
    setRotX(targetX);
    setRotY(targetY);
  };

  const faces = [
    { id: 'front', label: '🫀 Vitals', x: 0, y: 0 },
    { id: 'right', label: '⚡ Slot Lock', x: 0, y: -90 },
    { id: 'back', label: '🧠 Clinical AI', x: 0, y: -180 },
    { id: 'left', label: '🧪 NABL Labs', x: 0, y: 90 },
    { id: 'top', label: '🛡️ HIPAA Vault', x: -90, y: 0 },
    { id: 'bottom', label: '📊 Health Score', x: 90, y: 0 },
  ];

  return (
    <div
      className="relative flex flex-col items-center select-none py-6"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* 3D Perspective Scene */}
      <div 
        className="relative w-[300px] h-[300px] sm:w-[340px] sm:h-[340px] flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{ perspective: '1100px' }}
        onMouseDown={handleMouseDown}
      >
        {/* Holographic Glowing Orbital Rings */}
        <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-spin-slow pointer-events-none scale-125" />
        <div className="absolute inset-4 rounded-full border border-indigo-500/20 animate-reverse-spin pointer-events-none scale-110" />
        <div className="absolute inset-0 bg-radial-gradient from-cyan-500/10 via-transparent to-transparent pointer-events-none blur-2xl" />

        {/* The 3D Cube Container */}
        <div
          className="relative w-[240px] h-[240px] sm:w-[260px] sm:h-[260px] transition-transform duration-100 ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          }}
        >
          {/* FACE 1: FRONT - Biometric Vitals */}
          <div
            className="holo-face holo-face-front"
            style={{ transform: 'rotateY(0deg) translateZ(130px)' }}
          >
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
              <span className="flex items-center gap-1.5 text-xs font-black text-cyan-400">
                <Heart className="h-4 w-4 text-rose-400 animate-pulse" />
                LIVE VITALS
              </span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                Synced
              </span>
            </div>

            <div className="space-y-2 py-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-300">Heart Rate</span>
                <span className="text-xl font-black text-white">72 <span className="text-xs font-normal text-slate-400">bpm</span></span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-300">Blood Oxygen</span>
                <span className="text-xl font-black text-cyan-300">99%</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-300">Glucose (Fasting)</span>
                <span className="text-xl font-black text-emerald-300">98 <span className="text-xs font-normal text-slate-400">mg/dL</span></span>
              </div>
            </div>

            <div className="pt-2 border-t border-cyan-500/20 text-[10px] text-cyan-300/80 font-mono text-center flex items-center justify-center gap-1">
              <Activity className="h-3 w-3" />
              <span>Bio-Telemetry Matrix Active</span>
            </div>
          </div>

          {/* FACE 2: RIGHT - Redis Slot Lock */}
          <div
            className="holo-face holo-face-right"
            style={{ transform: 'rotateY(90deg) translateZ(130px)' }}
          >
            <div className="flex items-center justify-between border-b border-indigo-500/30 pb-2">
              <span className="flex items-center gap-1.5 text-xs font-black text-indigo-400">
                <Zap className="h-4 w-4 text-cyan-400" />
                CONCURRENCY ENGINE
              </span>
              <span className="text-[10px] text-indigo-300 font-bold bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-500/40">
                REDIS
              </span>
            </div>

            <div className="space-y-3 py-3 text-center">
              <div className="h-12 w-12 mx-auto rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-cyan-300 shadow-lg shadow-cyan-500/20">
                <Zap className="h-6 w-6 animate-bounce" />
              </div>
              <div>
                <p className="text-2xl font-black text-white">0.00%</p>
                <p className="text-[11px] text-slate-300">Double-Booking Collision Rate</p>
              </div>
            </div>

            <div className="text-[10px] text-indigo-300/90 font-mono text-center bg-indigo-950/40 py-1 rounded-lg border border-indigo-500/30">
              Pessimistic Key Lock: ACTIVE
            </div>
          </div>

          {/* FACE 3: BACK - Clinical AI Neural RAG */}
          <div
            className="holo-face holo-face-back"
            style={{ transform: 'rotateY(180deg) translateZ(130px)' }}
          >
            <div className="flex items-center justify-between border-b border-purple-500/30 pb-2">
              <span className="flex items-center gap-1.5 text-xs font-black text-purple-400">
                <BrainCircuit className="h-4 w-4 text-purple-300" />
                CLINICAL AI TRIAGE
              </span>
              <span className="text-[10px] text-purple-300 font-bold bg-purple-950/80 px-2 py-0.5 rounded-full border border-purple-500/40">
                RAG v2.5
              </span>
            </div>

            <div className="space-y-2 py-2">
              <p className="text-[11px] text-slate-300 leading-snug">
                Vectorized symptom embeddings with semantic matching to accredited pathology catalogs.
              </p>
              <div className="rounded-xl bg-purple-950/40 border border-purple-500/30 p-2 text-center">
                <span className="text-[10px] text-purple-300 uppercase font-bold">Avg Inference Latency</span>
                <p className="text-xl font-black text-white">&lt; 380 ms</p>
              </div>
            </div>

            <div className="text-[10px] text-purple-300/80 font-mono text-center">
              Embeddings: text-embedding-3
            </div>
          </div>

          {/* FACE 4: LEFT - NABL Accredited Labs */}
          <div
            className="holo-face holo-face-left"
            style={{ transform: 'rotateY(-90deg) translateZ(130px)' }}
          >
            <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
              <span className="flex items-center gap-1.5 text-xs font-black text-emerald-400">
                <Building2 className="h-4 w-4 text-emerald-300" />
                PARTNER LABS
              </span>
              <span className="text-[10px] text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40">
                ISO 15189
              </span>
            </div>

            <div className="space-y-2 py-2 text-center">
              <p className="text-3xl font-black text-white">100%</p>
              <p className="text-xs text-slate-300">NABL Accredited Centers</p>
              <div className="text-[11px] text-emerald-400 bg-emerald-950/50 py-1.5 rounded-xl border border-emerald-500/30">
                Automated Barcode Sample Tracking
              </div>
            </div>

            <div className="text-[10px] text-emerald-300/80 font-mono text-center">
              Direct HL7 / FHIR Integration
            </div>
          </div>

          {/* FACE 5: TOP - HIPAA Medical PDF Vault */}
          <div
            className="holo-face holo-face-top"
            style={{ transform: 'rotateX(90deg) translateZ(130px)' }}
          >
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
              <span className="flex items-center gap-1.5 text-xs font-black text-cyan-400">
                <ShieldCheck className="h-4 w-4 text-cyan-300" />
                HIPAA PDF VAULT
              </span>
              <span className="text-[10px] text-cyan-300 font-bold bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/40">
                AES-256
              </span>
            </div>

            <div className="space-y-2 py-2 text-center">
              <ShieldCheck className="h-10 w-10 mx-auto text-cyan-400" />
              <p className="text-base font-extrabold text-white">Encrypted at Rest</p>
              <p className="text-[11px] text-slate-300">Digitally signed diagnostic reports</p>
            </div>

            <div className="text-[10px] text-cyan-300/80 font-mono text-center">
              Automated OCR Extraction
            </div>
          </div>

          {/* FACE 6: BOTTOM - Health Score Matrix */}
          <div
            className="holo-face holo-face-bottom"
            style={{ transform: 'rotateX(-90deg) translateZ(130px)' }}
          >
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
              <span className="flex items-center gap-1.5 text-xs font-black text-amber-400">
                <TrendingUp className="h-4 w-4 text-amber-300" />
                BIOMARKER INDEX
              </span>
              <span className="text-[10px] text-amber-300 font-bold bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/40">
                TOP 5%
              </span>
            </div>

            <div className="space-y-2 py-2 text-center">
              <p className="text-4xl font-black text-white">94<span className="text-base text-slate-400">/100</span></p>
              <p className="text-xs text-amber-400 font-bold">Optimal Health Stability</p>
              <span className="inline-block text-[10px] text-slate-300 bg-amber-950/50 px-2.5 py-1 rounded-lg border border-amber-500/30">
                +12% Improvement vs Q2
              </span>
            </div>

            <div className="text-[10px] text-amber-300/80 font-mono text-center">
              18 Biomarkers Scanned
            </div>
          </div>
        </div>
      </div>

      {/* Floating 3D Interaction Control Dock */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 max-w-md px-4">
        {faces.map((face) => (
          <button
            key={face.id}
            onClick={() => snapToFace(face.id, face.x, face.y)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFace === face.id
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/30 border border-cyan-400/50 scale-105'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/10 hover:border-cyan-500/40'
            }`}
          >
            {face.label}
          </button>
        ))}

        <button
          onClick={() => {
            soundFx.playClick();
            setIsAutoRotating(!isAutoRotating);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            isAutoRotating
              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-500/20'
              : 'bg-slate-900/80 text-slate-400 border border-white/10 hover:text-white'
          }`}
          title="Toggle Auto 3D Orbit"
        >
          <RotateCw className={`h-3 w-3 ${isAutoRotating ? 'animate-spin' : ''}`} />
          <span>{isAutoRotating ? 'Orbiting' : 'Orbit 3D'}</span>
        </button>
      </div>

      <p className="text-[11px] text-slate-400 mt-2 font-mono flex items-center gap-1.5">
        <Sparkles className="h-3 w-3 text-cyan-400" />
        <span>Click & drag cube to inspect in full 3D space</span>
      </p>
    </div>
  );
};
