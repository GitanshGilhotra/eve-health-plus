import React, { useState, useRef, useEffect } from "react";
import { useAppStore } from "../store/useAppStore";
import { useAuthStore } from "../store/useAuthStore";
import {
  Search, Command, Bell, ShieldCheck,
  ChevronDown, UserCheck, Building2, Server, LogOut,
  Lock, KeyRound, User, Sparkles
} from "lucide-react";
import { ThemeSelector } from "./ThemeSelector";
import { soundFx } from "../shared/soundFx";

const BREADCRUMBS = {
  dashboard:          "Clinical Overview",
  centers:            "Diagnostic Labs",
  bookings:           "My Bookings",
  "payment-checkout": "Payment Checkout",
  "ai-assistant":     "AI Assistant",
  reports:            "Lab Reports",
  "center-admin":     "Lab Operations",
  "platform-admin":   "DevOps & Audit",
};

const ROLE_METAS = {
  PATIENT: {
    title: "Patient Portal",
    badge: "Verified Patient",
    desc: "Browse accredited labs, book slots & AI triage",
    icon: UserCheck,
    color: "#0ea5e9",
    bg: "rgba(14,165,233,0.12)",
    border: "rgba(14,165,233,0.3)"
  },
  CENTER_ADMIN: {
    title: "Lab Admin Console",
    badge: "Lab Operator",
    desc: "Manage pathology assays, pricing & phlebotomy queues",
    icon: Building2,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.3)"
  },
  PLATFORM_ADMIN: {
    title: "Platform DevOps",
    badge: "Root / DevOps",
    desc: "Redis distributed locks, audit logs & telemetry",
    icon: Server,
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.12)",
    border: "rgba(139,92,246,0.3)"
  },
};

export const Navbar = () => {
  const { setCommandPaletteOpen, activeTab, openAuthModal } = useAppStore();
  const { user, logout } = useAuthStore();
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setIsRoleOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const currentRole = ROLE_METAS[user?.role] || ROLE_METAS.PATIENT;
  const RoleIcon = currentRole.icon;

  const handleOpenLoginSwitcher = () => {
    soundFx.playClick?.();
    setIsRoleOpen(false);
    openAuthModal("PATIENT", "LOGIN");
  };

  const handleLogout = () => {
    soundFx.playClick?.();
    setIsRoleOpen(false);
    logout();
  };

  return (
    <header
      className="navbar-capsule"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 18px",
        marginBottom: 20
      }}
    >
      {/* Breadcrumb & Live status */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>Portal</span>
        <span style={{ color: "#334155", fontSize: 14 }}>/</span>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc", margin: 0, letterSpacing: "-0.01em" }}>
          {BREADCRUMBS[activeTab] || "Clinical Overview"}
        </h2>
        {/* Live status */}
        <div style={{
          display: "flex", alignItems: "center", gap: 5, marginLeft: 6,
          padding: "3px 10px", borderRadius: 99,
          background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.22)",
          fontSize: 10, fontFamily: "JetBrains Mono, monospace", fontWeight: 700, color: "#34d399"
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: "50%",
            background: "#10b981", boxShadow: "0 0 6px #10b981",
            animation: "pulse 2s infinite"
          }} />
          NABL Live
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Search */}
        <button
          onClick={() => { soundFx.playClick?.(); setCommandPaletteOpen(true); }}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 14px", borderRadius: 10,
            background: "rgba(7,12,22,0.8)", border: "1px solid var(--c-border, rgba(255,255,255,0.08))",
            cursor: "pointer", transition: "all 0.15s ease", width: 220, color: "#64748b"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--c-accent-border, rgba(14,165,233,0.3))";
            e.currentTarget.style.color = "#94a3b8";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--c-border, rgba(255,255,255,0.08))";
            e.currentTarget.style.color = "#64748b";
          }}
        >
          <Search size={13} />
          <span style={{ flex: 1, textAlign: "left", fontSize: 12, fontWeight: 500 }}>Search assays...</span>
          <span style={{
            display: "flex", alignItems: "center", gap: 2, fontSize: 10,
            fontFamily: "JetBrains Mono, monospace", color: "var(--c-accent, #0ea5e9)",
            background: "var(--c-accent-dim, rgba(14,165,233,0.1))",
            border: "1px solid var(--c-accent-border, rgba(14,165,233,0.2))",
            padding: "2px 6px", borderRadius: 6
          }}>
            <Command size={9} />K
          </span>
        </button>

        {/* Authenticated Workspace & Role Session */}
        <div style={{ position: "relative" }} ref={dropRef}>
          <button
            type="button"
            onClick={() => { soundFx.playClick?.(); setIsRoleOpen(!isRoleOpen); }}
            title="Click to view authenticated session details"
            style={{
              display: "flex", alignItems: "center", gap: 7, padding: "7px 12px",
              borderRadius: 10, cursor: "pointer", transition: "all 0.15s ease",
              background: currentRole.bg, border: `1px solid ${currentRole.border}`,
              color: currentRole.color, fontSize: 12, fontWeight: 700
            }}
          >
            <RoleIcon size={14} />
            <span>{currentRole.title}</span>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 3,
              fontSize: 9, fontFamily: "JetBrains Mono, monospace",
              padding: "1px 6px", borderRadius: 6,
              background: "rgba(0,0,0,0.3)", color: "white", fontWeight: 700
            }}>
              <ShieldCheck size={10} color="#34d399" />
              AUTH
            </span>
            <ChevronDown size={12} style={{ transition: "transform 0.2s", transform: isRoleOpen ? "rotate(180deg)" : "none" }} />
          </button>

          {isRoleOpen && (
            <div style={{
              position: "absolute", right: 0, top: "calc(100% + 8px)", zIndex: 9999,
              width: 320, borderRadius: 16,
              background: "var(--c-surface, rgba(6,10,20,0.98))",
              border: "1px solid var(--c-border-2, rgba(255,255,255,0.14))",
              boxShadow: "0 24px 64px rgba(0,0,0,0.85), 0 4px 16px rgba(0,0,0,0.5)",
              backdropFilter: "blur(24px)",
              padding: 12, animation: "fadeIn 0.15s ease"
            }}>
              {/* Header: Verified Session Identity */}
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                paddingBottom: 12, borderBottom: "1px solid var(--c-border, rgba(255,255,255,0.08))"
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  background: "var(--c-gradient-primary, linear-gradient(135deg, #0ea5e9, #6366f1))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontWeight: 900, fontSize: 14, flexShrink: 0,
                  boxShadow: "0 4px 12px rgba(14,165,233,0.3)"
                }}>
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <p style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc", margin: 0, truncate: "true" }}>
                      {user?.firstName} {user?.lastName}
                    </p>
                    <ShieldCheck size={13} color="#34d399" />
                  </div>
                  <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0", fontFamily: "JetBrains Mono, monospace" }}>
                    {user?.email}
                  </p>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 4, marginTop: 6,
                    padding: "2px 8px", borderRadius: 99,
                    background: currentRole.bg, border: `1px solid ${currentRole.border}`,
                    color: currentRole.color, fontSize: 10, fontWeight: 700, fontFamily: "JetBrains Mono, monospace"
                  }}>
                    <Lock size={10} />
                    ROLE: {user?.role}
                  </div>
                </div>
              </div>

              {/* Security policy note */}
              <div style={{
                margin: "10px 0", padding: "8px 10px", borderRadius: 10,
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                fontSize: 11, color: "#94a3b8", lineHeight: 1.4
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#f8fafc", fontWeight: 700, marginBottom: 2 }}>
                  <Lock size={11} color="var(--c-accent, #0ea5e9)" />
                  <span>Role-Based Access Enforced</span>
                </div>
                <p style={{ margin: 0, fontSize: 10.5, color: "#64748b" }}>
                  Workspace access is strictly governed by your authenticated login. Switching to administrative portals requires verified credentials.
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={handleOpenLoginSwitcher}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 8,
                    padding: "9px 12px", borderRadius: 10, cursor: "pointer",
                    background: "var(--c-accent-dim, rgba(14,165,233,0.12))",
                    border: "1px solid var(--c-accent-border, rgba(14,165,233,0.3))",
                    color: "#f8fafc", fontSize: 12, fontWeight: 700,
                    transition: "all 0.15s ease", textAlign: "left"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--c-accent-glow, rgba(14,165,233,0.22))";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--c-accent-dim, rgba(14,165,233,0.12))";
                  }}
                >
                  <KeyRound size={14} color="var(--c-accent, #0ea5e9)" />
                  <span style={{ flex: 1 }}>Sign In with Another Role</span>
                  <span style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", color: "var(--c-accent, #0ea5e9)" }}>Auth</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 12px", borderRadius: 10, cursor: "pointer",
                    background: "transparent",
                    border: "1px solid rgba(244,63,94,0.2)",
                    color: "#fda4af", fontSize: 12, fontWeight: 600,
                    transition: "all 0.15s ease", textAlign: "left"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(244,63,94,0.1)";
                    e.currentTarget.style.borderColor = "rgba(244,63,94,0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.borderColor = "rgba(244,63,94,0.2)";
                  }}
                >
                  <LogOut size={14} color="#f43f5e" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Selector */}
        <ThemeSelector />

        {/* Notifications */}
        <button
          type="button"
          onClick={() => soundFx.playClick?.()}
          style={{
            position: "relative", padding: 9, borderRadius: 10,
            background: "transparent", border: "1px solid var(--c-border, rgba(255,255,255,0.07))",
            cursor: "pointer", color: "#64748b", transition: "all 0.15s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#e2e8f0";
            e.currentTarget.style.borderColor = "var(--c-border-2, rgba(255,255,255,0.18))";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#64748b";
            e.currentTarget.style.borderColor = "var(--c-border, rgba(255,255,255,0.07))";
          }}
        >
          <Bell size={15} />
          <span style={{
            position: "absolute", top: 7, right: 7, width: 6, height: 6, borderRadius: "50%",
            background: "var(--c-accent, #0ea5e9)",
            boxShadow: "0 0 6px var(--c-accent, #0ea5e9)"
          }} />
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  );
};
