import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useAppStore } from "../store/useAppStore";
import { formatCurrency, formatDate } from "../shared/utils";
import {
  CalendarCheck, Building2, FileText, Activity,
  ArrowUpRight, Clock, Sparkles, ShieldCheck, Zap,
  CheckCircle2, Compass, QrCode, TrendingUp, Bot,
  ArrowRight, ChevronRight, Box
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { InteractiveHoloCube } from "../components/3d/InteractiveHoloCube";
import { InteractiveBiometricScanner3D } from "../components/3d/InteractiveBiometricScanner3D";
import { soundFx } from "../shared/soundFx";

const chartData = [
  { month: "May", score: 82 },
  { month: "Jun", score: 85 },
  { month: "Jul", score: 88 },
  { month: "Aug", score: 91 },
  { month: "Sep", score: 94 },
  { month: "Oct", score: 96 },
];

const MetricCard = ({ label, value, sub, accent, icon: Icon, onClick, tag }) => {
  const colors = {
    teal:    { bg: "rgba(14,165,233,0.1)",  border: "rgba(14,165,233,0.25)", text: "#38bdf8",  hover: "rgba(14,165,233,0.3)"  },
    emerald: { bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)", text: "#34d399",  hover: "rgba(16,185,129,0.3)"  },
    amber:   { bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)", text: "#fbbf24",  hover: "rgba(245,158,11,0.3)"  },
    violet:  { bg: "rgba(139,92,246,0.1)",  border: "rgba(139,92,246,0.25)", text: "#a78bfa",  hover: "rgba(139,92,246,0.3)"  },
  };
  const c = colors[accent] || colors.teal;

  return (
    <div
      className={`stat-card ${accent}`}
      onClick={onClick}
      style={{ position: "relative", overflow: "hidden" }}
    >
      {/* Top accent line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${c.text}40, transparent)`, borderRadius: "18px 18px 0 0" }} />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#475569" }}>{label}</span>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: c.bg, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={17} color={c.text} />
        </div>
      </div>

      <p style={{ fontSize: 32, fontWeight: 800, color: "#f1f5f9", margin: "0 0 6px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>{value}</p>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 10, marginTop: 4 }}>
        <span style={{ fontSize: 11, color: "#475569", fontWeight: 500 }}>{sub}</span>
        {tag && (
          <span style={{ fontSize: 9, fontFamily: "JetBrains Mono, monospace", fontWeight: 700, textTransform: "uppercase", padding: "2px 8px", borderRadius: 99, background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
            {tag}
          </span>
        )}
      </div>
    </div>
  );
};

const StatusPill = ({ status }) => {
  const map = {
    CONFIRMED:   "confirmed",
    PENDING:     "pending",
    CANCELLED:   "cancelled",
    FAILED:      "failed",
    COMPLETED:   "completed",
    RESCHEDULED: "rescheduled",
  };
  return <span className={`status-pill ${map[status] || "pending"}`}>{status}</span>;
};

export const Dashboard = () => {
  const { user } = useAuthStore();
  const { bookings, openBookingModal, centers, setActiveTab, setPendingCheckoutBooking } = useAppStore();
  const [filterState, setFilterState] = useState("ALL");
  const [showSpatial, setShowSpatial] = useState(false);

  const confirmed = bookings.filter((b) => b.status === "CONFIRMED" || b.status === "PENDING").length;
  const totalSpent = bookings
    .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
    .reduce((a, c) => a + c.amount, 0);

  const displayed = bookings.filter((b) => filterState === "ALL" || b.status === filterState);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 64 }}>

      {/* ── Hero Banner ──────────────────────────────── */}
      <div className="hero-banner" style={{ padding: "36px 40px" }}>
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Tags */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="pill-tag pill-teal">
              <ShieldCheck size={10} /> Enterprise Clinical Portal
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#34d399", fontWeight: 500 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981", display: "inline-block" }} />
              NABL Accredited · Redis Protected
            </span>
          </div>

          {/* Heading */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <h1 style={{ fontSize: 32, fontWeight: 800, color: "white", margin: "0 0 10px", letterSpacing: "-0.03em", lineHeight: 1.15 }}>
                Welcome back,{" "}
                <span style={{ background: "linear-gradient(135deg, #38bdf8, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {user?.firstName || "Patient"} {user?.lastName || ""}
                </span>
              </h1>
              <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.65, margin: "0 0 20px", maxWidth: 500 }}>
                Manage diagnostic appointments, view digital lab records, and run AI pre-triage with guaranteed slot reservations.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="btn-primary" onClick={() => { soundFx.playClick?.(); setActiveTab("centers"); }}>
                  <Compass size={14} /> Explore Labs
                </button>
                <button className="btn-secondary" onClick={() => { soundFx.playClick?.(); setActiveTab("ai-assistant"); }}>
                  <Sparkles size={14} color="#0ea5e9" /> Consult AI
                </button>
              </div>
            </div>

            {/* Health Index Card */}
            <div style={{ background: "rgba(7,12,22,0.7)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "20px 24px", minWidth: 220, backdropFilter: "blur(20px)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 10 }}>
                <span style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em" }}>Health Index</span>
                <span className="pill-tag pill-emerald">Optimal</span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 40, fontWeight: 800, color: "white", letterSpacing: "-0.04em" }}>96</span>
                <span style={{ fontSize: 11, color: "#475569", fontFamily: "JetBrains Mono, monospace" }}>/ 100</span>
              </div>
              <p style={{ fontSize: 11, color: "#475569", lineHeight: 1.5, margin: 0 }}>Based on CBC and Lipid panels from Metropolis Labs.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Metric Cards ─────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <MetricCard label="Active Slots" value={confirmed} sub="Upcoming appointments" accent="teal"    icon={CalendarCheck} tag="Redis Lock" onClick={() => { soundFx.playClick?.(); setActiveTab("bookings"); }} />
        <MetricCard label="Total Spend"  value={formatCurrency(totalSpent)} sub="Confirmed payments" accent="emerald" icon={ShieldCheck} tag="Verified" onClick={() => { soundFx.playClick?.(); setActiveTab("bookings"); }} />
        <MetricCard label="Partner Labs" value={`${centers.length}`}        sub="Accredited centers" accent="amber"   icon={Building2}  tag="NABL"    onClick={() => { soundFx.playClick?.(); setActiveTab("centers"); }} />
        <MetricCard label="Lab Reports"  value="2"                           sub="Digital PDF vault"  accent="violet"  icon={FileText}   tag="AES-256" onClick={() => { soundFx.playClick?.(); setActiveTab("reports"); }} />
      </div>

      {/* ── Main 2-Col ───────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20, alignItems: "start" }}>

        {/* Appointments List */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>Appointments</h2>
              <span className="pill-tag pill-teal">{bookings.length}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div className="tab-bar">
                {["ALL","CONFIRMED","PENDING"].map((s) => (
                  <button key={s} className={`tab-item ${filterState === s ? "active" : ""}`} onClick={() => { soundFx.playClick?.(); setFilterState(s); }}>{s}</button>
                ))}
              </div>
              <button onClick={() => { soundFx.playClick?.(); setActiveTab("bookings"); }} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 600, color: "#0ea5e9", cursor: "pointer", background: "none", border: "none", padding: 4 }}>
                All <ArrowUpRight size={13} />
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {displayed.length === 0 ? (
              <div className="empty-state">
                <CalendarCheck size={40} color="#1e293b" />
                <p style={{ fontWeight: 700, color: "#e2e8f0", margin: "14px 0 6px", fontSize: 15 }}>No appointments</p>
                <p style={{ fontSize: 13, color: "#475569", margin: "0 0 18px" }}>Schedule a certified test from accredited labs.</p>
                <button className="btn-primary" style={{ fontSize: 12 }} onClick={() => { soundFx.playClick?.(); setActiveTab("centers"); }}>Browse Labs</button>
              </div>
            ) : (
              displayed.map((b) => (
                <div
                  key={b.id}
                  className="row-item"
                  style={{ flexWrap: "wrap", gap: 14 }}
                >
                  <div style={{ flex: 1, minWidth: 180, display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <StatusPill status={b.status} />
                      <span className="mono-label">#{b.id?.slice(-8)}</span>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>{b.test?.name || "Diagnostic Assay"}</p>
                    <p style={{ fontSize: 12, color: "#475569", margin: 0 }}>{b.center?.name} · <span style={{ color: "#38bdf8" }}><Clock size={10} style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} />{formatDate(b.appointmentDate)}</span></p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                    <p style={{ fontSize: 20, fontWeight: 800, color: "white", margin: 0, letterSpacing: "-0.02em" }}>{formatCurrency(b.amount)}</p>
                    {b.status === "PENDING" ? (
                      <button className="btn-primary" style={{ fontSize: 11, padding: "6px 14px" }} onClick={() => { soundFx.playClick?.(); setPendingCheckoutBooking(b); setActiveTab("payment-checkout"); }}>
                        <QrCode size={12} /> Pay Now
                      </button>
                    ) : (
                      <button className="btn-ghost" style={{ fontSize: 11 }} onClick={() => { soundFx.playClick?.(); openBookingModal(b.center, b.test); }}>Details</button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right col */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Health Chart */}
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <p className="section-label" style={{ marginBottom: 4 }}>Biomarker Trajectory</p>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>Monthly Score</h3>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Activity size={16} color="#38bdf8" />
              </div>
            </div>
            <div style={{ height: 160 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#1e293b" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: "#475569" }} />
                  <YAxis stroke="#1e293b" fontSize={10} tickLine={false} axisLine={false} domain={[75, 100]} tick={{ fill: "#475569" }} />
                  <Tooltip contentStyle={{ backgroundColor: "#0b1121", border: "1px solid rgba(14,165,233,0.3)", borderRadius: 12, fontSize: 12, color: "#e2e8f0", boxShadow: "0 10px 30px rgba(0,0,0,0.6)" }} />
                  <Area type="monotone" dataKey="score" stroke="#0ea5e9" strokeWidth={2.5} fillOpacity={1} fill="url(#grad1)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 12, marginTop: 12 }}>
              <span style={{ fontSize: 11, color: "#475569" }}>Metabolic Stability</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#34d399" }}>+12% vs last quarter</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-card" style={{ padding: 20 }}>
            <p className="section-label" style={{ marginBottom: 14 }}>Quick Actions</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "AI Diagnostic Pre-Triage", sub: "Describe symptoms, get test recommendations", icon: Bot, tab: "ai-assistant", color: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.25)", text: "#a78bfa" },
                { label: "Download Lab Reports", sub: "OCR-extracted biomarker PDFs", icon: FileText, tab: "reports", color: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.25)", text: "#34d399" },
                { label: "Browse More Assays", sub: "Explore accredited partner labs", icon: Building2, tab: "centers", color: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", text: "#fbbf24" },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.tab}
                    onClick={() => { soundFx.playClick?.(); setActiveTab(action.tab); }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 14px",
                      borderRadius: 12, background: "rgba(7,12,22,0.6)", border: "1px solid rgba(255,255,255,0.06)",
                      cursor: "pointer", transition: "all 0.15s ease", textAlign: "left"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = action.border; e.currentTarget.style.background = action.color; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "rgba(7,12,22,0.6)"; }}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: action.color, border: `1px solid ${action.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={15} color={action.text} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", margin: 0 }}>{action.label}</p>
                      <p style={{ fontSize: 11, color: "#475569", margin: "2px 0 0" }}>{action.sub}</p>
                    </div>
                    <ArrowRight size={14} color="#334155" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3D Lab ───────────────────────────────────── */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <Box size={17} color="#0ea5e9" />
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>Spatial 3D Diagnostic Studio</h2>
            </div>
            <p style={{ fontSize: 12, color: "#475569", margin: 0 }}>Interactive 3D organ scanning and diagnostic HoloCube visualization.</p>
          </div>
          <button className="btn-secondary" style={{ fontSize: 12 }} onClick={() => { soundFx.playClick?.(); setShowSpatial(!showSpatial); }}>
            {showSpatial ? "Collapse Studio" : "Open 3D Studio"}
            <ChevronRight size={13} style={{ transform: showSpatial ? "rotate(90deg)" : "none", transition: "0.2s" }} />
          </button>
        </div>
        {showSpatial && (
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: "rgba(7,12,22,0.8)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 16 }}>
              <p className="section-label" style={{ marginBottom: 12 }}>Diagnostic HoloCube</p>
              <InteractiveHoloCube />
            </div>
            <div style={{ background: "rgba(7,12,22,0.8)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 16 }}>
              <p className="section-label" style={{ marginBottom: 12 }}>Biometric Scanner</p>
              <InteractiveBiometricScanner3D />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
