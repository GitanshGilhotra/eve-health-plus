import React from "react";
import { motion } from "framer-motion";
import {
  Activity, ArrowRight, Shield, Zap,
  Building2, BrainCircuit, Sparkles, Lock,
  ChevronRight, FileCheck2, Heart
} from "lucide-react";
import { InteractiveHoloCube } from "../components/3d/InteractiveHoloCube";
import { EcgPulseMonitor } from "../components/3d/EcgPulseMonitor";
import { soundFx } from "../shared/soundFx";

const FeatureCard = ({ icon: Icon, title, description, badge, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 32 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.55, delay }}
    style={{
      background: "rgba(11,17,33,0.8)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 20, padding: "32px 28px",
      display: "flex", flexDirection: "column", gap: 16,
      transition: "all 0.2s ease", position: "relative", overflow: "hidden"
    }}
    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(14,165,233,0.3)"; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 20px 50px rgba(0,0,0,0.5)"; }}
    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
  >
    {/* Shine */}
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(14,165,233,0.3), transparent)", opacity: 0, transition: "opacity 0.2s" }} />
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ width: 52, height: 52, borderRadius: 15, background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={24} color="#38bdf8" />
      </div>
      {badge && (
        <span style={{ fontSize: 9, fontFamily: "JetBrains Mono, monospace", fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.25)", color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {badge}
        </span>
      )}
    </div>
    <div>
      <h3 style={{ fontSize: 17, fontWeight: 700, color: "#f1f5f9", margin: "0 0 8px", letterSpacing: "-0.02em" }}>{title}</h3>
      <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.7, margin: 0 }}>{description}</p>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "#0ea5e9", marginTop: 4 }}>
      Learn more <ChevronRight size={13} />
    </div>
  </motion.div>
);

const STATS = [
  { value: "100%", label: "Atomic Slot Lock",    color: "#f1f5f9" },
  { value: "NABL", label: "ISO 15189 Standard",  color: "#0ea5e9" },
  { value: "<380ms",label: "AI Triage Latency",  color: "#8b5cf6" },
  { value: "HIPAA", label: "AES-256 Encrypted",  color: "#10b981" },
];

export const LandingPage = ({ onOpenAuth, onLaunchDemo }) => (
  <div style={{ minHeight: "100vh", color: "#e2e8f0", overflowX: "hidden", fontFamily: "Inter, sans-serif", position: "relative" }}>
    <div className="aurora-orb-1" />
    <div className="aurora-orb-2" />
    <div className="aurora-orb-3" />

    {/* ── Navbar ────────────────────────────────────── */}
    <nav style={{
      position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)",
      zIndex: 50, width: "92%", maxWidth: 1100,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "12px 24px",
      background: "rgba(6,10,20,0.88)", border: "1px solid rgba(255,255,255,0.09)",
      borderRadius: 16, backdropFilter: "blur(20px)",
      boxShadow: "0 4px 30px rgba(0,0,0,0.4)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #0ea5e9, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(14,165,233,0.3)" }}>
          <Activity size={18} color="white" />
        </div>
        <span style={{ fontSize: 17, fontWeight: 800, color: "white", letterSpacing: "-0.02em" }}>
          EVE<span style={{ color: "#0ea5e9", fontWeight: 300 }}>Health</span><span style={{ color: "#8b5cf6", fontSize: 13 }}>+</span>
        </span>
      </div>

      <div style={{ display: "none", alignItems: "center", gap: 28, fontSize: 13, fontWeight: 500, color: "#64748b" }} className="md-nav">
        <a href="#features" style={{ textDecoration: "none", color: "#64748b", transition: "color 0.15s" }} onMouseEnter={(e) => e.target.style.color = "#e2e8f0"} onMouseLeave={(e) => e.target.style.color = "#64748b"}>Platform</a>
        <a href="#spatial" style={{ textDecoration: "none", color: "#64748b", transition: "color 0.15s" }} onMouseEnter={(e) => e.target.style.color = "#e2e8f0"} onMouseLeave={(e) => e.target.style.color = "#64748b"}>3D Module</a>
        <a href="#compliance" style={{ textDecoration: "none", color: "#64748b", transition: "color 0.15s" }} onMouseEnter={(e) => e.target.style.color = "#e2e8f0"} onMouseLeave={(e) => e.target.style.color = "#64748b"}>Compliance</a>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={() => { soundFx.playClick?.(); onOpenAuth("PATIENT", "LOGIN"); }}
          style={{ padding: "8px 18px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#94a3b8", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
        >Sign In</button>
        <button className="btn-primary" style={{ fontSize: 13 }} onClick={() => { soundFx.playClick?.(); onLaunchDemo(); }}>
          Live Demo <ArrowRight size={13} />
        </button>
      </div>
    </nav>

    {/* ── Hero ──────────────────────────────────────── */}
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "140px 24px 80px", textAlign: "center", position: "relative", zIndex: 10 }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 99, border: "1px solid rgba(14,165,233,0.3)", background: "rgba(14,165,233,0.08)", fontSize: 11, fontWeight: 700, color: "#38bdf8", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 28 }}>
        <Sparkles size={12} /> Redefining Medical Diagnostic Operating Systems
      </motion.div>

      <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} style={{ fontSize: "clamp(40px, 7vw, 80px)", fontWeight: 800, color: "white", margin: "0 0 24px", letterSpacing: "-0.04em", lineHeight: 1.05 }}>
        Health Tech,<br />
        <span style={{ background: "linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Engineered for Precision.</span>
      </motion.h1>

      <motion.p initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} style={{ fontSize: 18, color: "#64748b", maxWidth: 600, margin: "0 auto 40px", lineHeight: 1.7, fontWeight: 400 }}>
        Enterprise-grade diagnostic platform unifying accredited partner labs, atomic Redis slot locking, and clinical AI symptom pre-triage — all in one beautiful interface.
      </motion.p>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
        <button className="btn-primary" style={{ fontSize: 15, padding: "12px 28px" }} onClick={() => { soundFx.playClick?.(); onLaunchDemo(); }}>
          Launch Platform <ArrowRight size={15} />
        </button>
        <button className="btn-secondary" style={{ fontSize: 15, padding: "12px 28px" }} onClick={() => { soundFx.playClick?.(); onOpenAuth("CENTER_ADMIN"); }}>
          Lab Admin Portal
        </button>
      </motion.div>

      {/* ECG monitor */}
      <div style={{ marginTop: 48, maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
        <EcgPulseMonitor />
      </div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }} style={{ marginTop: 56, paddingTop: 48, borderTop: "1px solid rgba(255,255,255,0.06)", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, maxWidth: 700, margin: "56px auto 0" }}>
        {STATS.map((s) => (
          <div key={s.value} style={{ padding: "16px 12px", borderRadius: 16, background: "rgba(11,17,33,0.7)", border: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
            <p style={{ fontSize: 22, fontWeight: 800, color: s.color, margin: "0 0 5px", letterSpacing: "-0.02em" }}>{s.value}</p>
            <p style={{ fontSize: 11, color: "#475569", margin: 0, fontWeight: 500 }}>{s.label}</p>
          </div>
        ))}
      </motion.div>
    </main>

    {/* ── 3D HoloCube ────────────────────────────────── */}
    <section id="spatial" style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 60px", position: "relative", zIndex: 10 }}>
      <div className="hero-banner" style={{ padding: "48px 40px", textAlign: "center" }}>
        <span style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", fontWeight: 700, color: "#38bdf8", background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.3)", padding: "4px 14px", borderRadius: 99, textTransform: "uppercase", letterSpacing: "0.08em", display: "inline-block", marginBottom: 16 }}>
          Spatial Computing & 3D Telemetry
        </span>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: "white", margin: "0 0 12px", letterSpacing: "-0.03em" }}>Interactive Diagnostic HoloCube</h2>
        <p style={{ fontSize: 14, color: "#64748b", maxWidth: 500, margin: "0 auto 32px", lineHeight: 1.7 }}>
          Drag in 3D space to inspect vital biometrics, concurrency engine state, and neural AI triage inference.
        </p>
        <InteractiveHoloCube />
      </div>
    </section>

    {/* ── Features ───────────────────────────────────── */}
    <section id="features" style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 80px", position: "relative", zIndex: 10 }}>
      <div style={{ textAlign: "center", marginBottom: 52 }}>
        <span style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", fontWeight: 700, color: "#38bdf8", background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.3)", padding: "4px 14px", borderRadius: 99, textTransform: "uppercase", letterSpacing: "0.08em", display: "inline-block", marginBottom: 16 }}>Intelligent Infrastructure</span>
        <h2 style={{ fontSize: 36, fontWeight: 800, color: "white", margin: "0 0 12px", letterSpacing: "-0.03em" }}>Architected for Modern Medicine</h2>
        <p style={{ fontSize: 15, color: "#64748b", maxWidth: 520, margin: "0 auto" }}>Every module is hardened for hospital-grade deployment.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
        <FeatureCard delay={0.1} icon={BrainCircuit} badge="LangChain + RAG" title="Clinical AI Pre-Triage" description="Evaluates patient symptoms against clinical vector indices to infer differential diagnoses and advise corresponding tests." />
        <FeatureCard delay={0.2} icon={Zap} badge="Redis Distributed" title="Concurrency Slot Lock" description="Guarantees zero double-booking across thousands of simultaneous patient reservations using pessimistic Redis lock keys." />
        <FeatureCard delay={0.3} icon={Shield} badge="AES-256 GCM" title="HIPAA-Ready PDF Vault" description="Diagnostic lab reports are digitally signed, encrypted, and parsed via automated OCR biomarker extraction." />
        <FeatureCard delay={0.4} icon={Building2} badge="Multi-Tenant" title="Multi-Center Network" description="Real-time multi-tenant dashboard for partner labs to manage assays, slots, pricing, and webhook events." />
        <FeatureCard delay={0.5} icon={Lock} badge="JWT + Argon2" title="Hardened Auth" description="Short-lived access tokens, rotating refresh tokens, account lockout after 5 failures, and per-request role guards." />
        <FeatureCard delay={0.6} icon={FileCheck2} badge="Idempotent" title="Webhook Engine" description="Idempotent payment webhooks with distributed Redis locks and per-event deduplication prevent any double processing." />
      </div>
    </section>

    {/* ── CTA ────────────────────────────────────────── */}
    <section style={{ maxWidth: 900, margin: "0 auto 80px", padding: "0 24px", position: "relative", zIndex: 10 }}>
      <div className="hero-banner" style={{ padding: "64px 48px", textAlign: "center" }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, color: "white", margin: "0 0 14px", letterSpacing: "-0.03em" }}>Ready to experience the future?</h2>
        <p style={{ fontSize: 15, color: "#64748b", maxWidth: 500, margin: "0 auto 32px", lineHeight: 1.7 }}>
          Test the complete end-to-end workflow: patient booking, AI clinical chat, lab reports, and center operations.
        </p>
        <button className="btn-primary" style={{ fontSize: 15, padding: "13px 32px" }} onClick={() => { soundFx.playClick?.(); onLaunchDemo(); }}>
          Explore Dashboard <ArrowRight size={15} />
        </button>
      </div>
    </section>

    {/* ── Footer ─────────────────────────────────────── */}
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "28px 24px", position: "relative", zIndex: 10 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#475569" }}>
          <Activity size={15} color="#0ea5e9" />
          <span style={{ fontWeight: 700, color: "#94a3b8" }}>EVE Health+</span>
          <span>· Enterprise Diagnostic SaaS</span>
        </div>
        <p style={{ fontSize: 12, color: "#334155", margin: 0 }}>© 2026 EVE Health Technologies Inc. All rights reserved.</p>
      </div>
    </footer>
  </div>
);
