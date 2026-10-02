import React from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useAppStore } from "../store/useAppStore";
import {
  LayoutDashboard, Building2, CalendarCheck, Bot,
  FileText, Server, Activity, LogOut, Sparkles,
  ChevronRight, ShieldCheck, Microscope
} from "lucide-react";
import { soundFx } from "../shared/soundFx";

const NAV_ITEMS = [
  { id: "dashboard",      label: "Overview",       sub: "Patient dashboard",    icon: LayoutDashboard, roles: ["PATIENT","CENTER_ADMIN","PLATFORM_ADMIN"] },
  { id: "centers",        label: "Diagnostic Labs", sub: "Browse & book tests", icon: Building2,        roles: ["PATIENT","CENTER_ADMIN","PLATFORM_ADMIN"] },
  { id: "bookings",       label: "My Bookings",     sub: "Appointments & slots", icon: CalendarCheck,   roles: ["PATIENT","CENTER_ADMIN","PLATFORM_ADMIN"] },
  { id: "ai-assistant",   label: "AI Assistant",    sub: "Clinical pre-triage",  icon: Bot,             roles: ["PATIENT","CENTER_ADMIN","PLATFORM_ADMIN"] },
  { id: "reports",        label: "Lab Reports",     sub: "PDF vault & records",  icon: FileText,        roles: ["PATIENT","CENTER_ADMIN","PLATFORM_ADMIN"] },
  { id: "center-admin",   label: "Lab Operations",  sub: "Manage tests & queue", icon: Activity,        roles: ["CENTER_ADMIN","PLATFORM_ADMIN"] },
  { id: "platform-admin", label: "DevOps & Audit",  sub: "System telemetry",     icon: Server,          roles: ["PLATFORM_ADMIN"] },
];

const ROLE_META = {
  PATIENT:        { label: "Patient",      color: "#0ea5e9", bg: "rgba(14,165,233,0.12)", border: "rgba(14,165,233,0.25)" },
  CENTER_ADMIN:   { label: "Lab Admin",    color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)" },
  PLATFORM_ADMIN: { label: "Platform Admin", color: "#8b5cf6", bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.25)" },
};

export const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const { activeTab, setActiveTab, bookings, centers } = useAppStore();

  const filtered = NAV_ITEMS.filter((i) => user && i.roles.includes(user.role));
  const role = ROLE_META[user?.role] || ROLE_META.PATIENT;

  const getBadge = (id) => {
    if (id === "centers" && centers.length) return centers.length;
    if (id === "bookings" && bookings.length) return bookings.length;
    if (id === "ai-assistant") return "AI";
    return null;
  };

  return (
    <aside
      className="sidebar-island flex flex-col h-[calc(100vh-2rem)] sticky top-4 z-40 select-none"
      style={{ width: 256, margin: "1rem 0 1rem 1rem", padding: "1.25rem" }}
    >
      {/* ── Brand ─────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40, height: 40,
            background: "var(--c-gradient-primary, linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%))",
            borderRadius: 12,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 16px var(--c-accent-glow, rgba(14,165,233,0.35))",
            flexShrink: 0
          }}>
            <Activity size={20} color="white" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: "white", letterSpacing: "-0.02em", lineHeight: 1.2 }}>EVE</span>
              <span style={{ fontSize: 18, fontWeight: 300, color: "var(--c-accent, #0ea5e9)", letterSpacing: "-0.02em", lineHeight: 1.2 }}>Health</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: "var(--c-secondary, #8b5cf6)", lineHeight: 1.2 }}>+</span>
            </div>
            <p style={{ fontSize: 10, color: "#64748b", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 1 }}>Diagnostic OS</p>
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 20 }} />

      {/* ── Role Badge ────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 12, paddingLeft: 4, paddingRight: 4
      }}>
        <span style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>Workspace</span>
        <span style={{
          fontSize: 9, fontFamily: "JetBrains Mono, monospace", fontWeight: 700,
          padding: "2px 8px", borderRadius: 99, textTransform: "uppercase", letterSpacing: "0.06em",
          background: role.bg, border: `1px solid ${role.border}`, color: role.color
        }}>{role.label}</span>
      </div>

      {/* ── Navigation ────────────────────────────────── */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        {filtered.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const badge = getBadge(item.id);

          return (
            <button
              key={item.id}
              onClick={() => { soundFx.playClick?.(); setActiveTab(item.id); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "9px 12px", borderRadius: 12, border: "1px solid",
                cursor: "pointer", transition: "all 0.15s ease", textAlign: "left",
                background: isActive ? "var(--c-accent-dim, rgba(14,165,233,0.1))" : "transparent",
                borderColor: isActive ? "var(--c-accent-border, rgba(14,165,233,0.3))" : "transparent",
              }}
              onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; } }}
              onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; } }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <Icon
                  size={16}
                  color={isActive ? "var(--c-accent-hover, #38bdf8)" : "#64748b"}
                  style={{ flexShrink: 0, transition: "color 0.15s ease" }}
                />
                <div>
                  <p style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? "#f8fafc" : "#94a3b8", lineHeight: 1.3, margin: 0 }}>
                    {item.label}
                  </p>
                  <p style={{ fontSize: 10, color: isActive ? "#94a3b8" : "#475569", margin: 0, marginTop: 1 }}>
                    {item.sub}
                  </p>
                </div>
              </div>
              {badge && (
                <span style={{
                  fontSize: 9, fontFamily: "JetBrains Mono, monospace", fontWeight: 700,
                  padding: "2px 7px", borderRadius: 99,
                  background: isActive ? "var(--c-accent-dim, rgba(14,165,233,0.2))" : "rgba(255,255,255,0.06)",
                  border: `1px solid ${isActive ? "var(--c-accent-border, rgba(14,165,233,0.4))" : "rgba(255,255,255,0.08)"}`,
                  color: isActive ? "var(--c-accent-hover, #38bdf8)" : "#64748b",
                  flexShrink: 0
                }}>{badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "16px 0" }} />

      {/* ── AI Quick Launch ────────────────────────────── */}
      <button
        onClick={() => { soundFx.playClick?.(); setActiveTab("ai-assistant"); }}
        style={{
          width: "100%", padding: "11px 14px", borderRadius: 12,
          background: "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(14,165,233,0.1) 100%)",
          border: "1px solid rgba(99,102,241,0.25)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          cursor: "pointer", transition: "all 0.15s ease", marginBottom: 12,
          textAlign: "left"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9,
            background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Sparkles size={14} color="#a78bfa" />
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#c4b5fd", margin: 0 }}>AI Diagnostics</p>
            <p style={{ fontSize: 10, color: "#6366f1", margin: 0 }}>Clinical pre-triage</p>
          </div>
        </div>
        <ChevronRight size={14} color="#6366f1" />
      </button>

      {/* ── User Profile ───────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 12px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 12
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 800, color: "white",
            flexShrink: 0,
            boxShadow: "0 2px 8px rgba(14,165,233,0.3)"
          }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.firstName} {user?.lastName}
            </p>
            <p style={{ fontSize: 10, color: "#475569", margin: 0, fontFamily: "JetBrains Mono, monospace" }}>
              {role.label}
            </p>
          </div>
        </div>
        <button
          onClick={() => { soundFx.playClick?.(); logout(); }}
          title="Sign out"
          style={{
            padding: 7, borderRadius: 8, background: "transparent", border: "1px solid transparent",
            cursor: "pointer", color: "#475569", transition: "all 0.15s ease", flexShrink: 0
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#fb7185"; e.currentTarget.style.background = "rgba(244,63,94,0.08)"; e.currentTarget.style.borderColor = "rgba(244,63,94,0.2)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#475569"; e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}
        >
          <LogOut size={15} />
        </button>
      </div>
    </aside>
  );
};
