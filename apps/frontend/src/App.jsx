import React, { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Navbar } from "./components/Navbar";
import { CommandPalette } from "./components/CommandPalette";
import { BookingModal } from "./components/BookingModal";
import { AuthModal } from "./components/AuthModal";
import { LandingPage } from "./pages/LandingPage";
import { Dashboard } from "./pages/Dashboard";
import { CentersPage } from "./pages/CentersPage";
import { BookingsPage } from "./pages/BookingsPage";
import { AIAssistantPage } from "./pages/AIAssistantPage";
import { ReportsPage } from "./pages/ReportsPage";
import { CenterAdminPage } from "./pages/CenterAdminPage";
import { PlatformAdminPage } from "./pages/PlatformAdminPage";
import { PaymentPage } from "./pages/PaymentPage";
import { useAppStore } from "./store/useAppStore";
import { useAuthStore } from "./store/useAuthStore";
import { ShieldAlert, Lock, KeyRound, ArrowLeft, CheckCircle2 } from "lucide-react";
import { soundFx } from "./shared/soundFx";

// ── Role-Based Access Control (RBAC) Guard Screen ──────────────
const RestrictedAccessGuard = ({ requiredRole, roleTitle, currentRole, onSignInAdmin, onBackToOverview }) => {
  return (
    <div style={{
      padding: "3rem 1.5rem",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "65vh"
    }}>
      <div className="glass-card" style={{
        maxWidth: 580,
        width: "100%",
        padding: "2.5rem 2rem",
        textAlign: "center",
        border: "1px solid rgba(244,63,94,0.3)",
        background: "radial-gradient(ellipse at 50% 0%, rgba(244,63,94,0.1) 0%, var(--c-surface) 75%)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 30px rgba(244,63,94,0.15)",
        position: "relative",
        borderRadius: 24,
      }}>
        {/* Glow badge */}
        <div style={{
          width: 64, height: 64, borderRadius: 20,
          background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 1.5rem",
          boxShadow: "0 8px 24px rgba(244,63,94,0.2)"
        }}>
          <ShieldAlert size={32} color="#f43f5e" />
        </div>

        <div style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "3px 10px", borderRadius: 99,
          background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.25)",
          color: "#fda4af", fontSize: 10, fontFamily: "JetBrains Mono, monospace", fontWeight: 700,
          textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12
        }}>
          <Lock size={11} />
          Access Denied · Role Clearance Required
        </div>

        <h3 style={{ fontSize: 20, fontWeight: 800, color: "#f8fafc", margin: "0 0 8px" }}>
          {roleTitle}
        </h3>

        <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, margin: "0 auto 1.5rem", maxWidth: 440 }}>
          Your current authenticated session <strong style={{ color: "#f8fafc" }}>({currentRole})</strong> does not possess the requisite operational credentials to access this workspace. Diagnostic records and backend operations are protected by role-based authorization.
        </p>

        <div style={{
          background: "rgba(0,0,0,0.3)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 14,
          padding: "12px 16px",
          marginBottom: "1.75rem",
          textAlign: "left",
          fontSize: 11,
          fontFamily: "JetBrains Mono, monospace",
          color: "#64748b"
        }}>
          <p style={{ margin: 0, color: "#cbd5e1", fontWeight: 600 }}>Security Policy Enforced:</p>
          <p style={{ margin: "4px 0 0", color: "#94a3b8" }}>
            • Required Role: <span style={{ color: "#f59e0b", fontWeight: 700 }}>{requiredRole}</span><br />
            • Current Session: <span style={{ color: "#38bdf8", fontWeight: 700 }}>{currentRole}</span>
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={onSignInAdmin}
            className="btn-primary"
            style={{ fontSize: 12, padding: "10px 20px" }}
          >
            <KeyRound size={14} />
            <span>Sign In with {requiredRole === "CENTER_ADMIN" ? "Lab Admin" : "DevOps"} Account</span>
          </button>

          <button
            type="button"
            onClick={onBackToOverview}
            className="btn-secondary"
            style={{ fontSize: 12, padding: "10px 18px" }}
          >
            <ArrowLeft size={14} />
            <span>Return to Overview</span>
          </button>
        </div>
      </div>
    </div>
  );
};

function App() {
  const {
    activeTab,
    setActiveTab,
    theme,
    isAuthModalOpen,
    authModalRole,
    authModalTab,
    openAuthModal,
    closeAuthModal
  } = useAppStore();

  const { user } = useAuthStore();
  const [viewMode, setViewMode] = useState("landing");

  const handleOpenAuth = (role = "PATIENT", tab = "LOGIN") => {
    soundFx.playClick?.();
    openAuthModal(role, tab);
  };

  const renderPage = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "centers":
        return <CentersPage />;
      case "bookings":
        return <BookingsPage />;
      case "payment-checkout":
      case "payments":
        return <PaymentPage />;
      case "ai-assistant":
        return <AIAssistantPage />;
      case "reports":
        return <ReportsPage />;
      case "center-admin":
        // RBAC Guard: Only CENTER_ADMIN or PLATFORM_ADMIN can access Lab Admin Operations
        if (user && user.role !== "CENTER_ADMIN" && user.role !== "PLATFORM_ADMIN") {
          return (
            <RestrictedAccessGuard
              requiredRole="CENTER_ADMIN"
              roleTitle="Lab Operations Console"
              currentRole={user.role}
              onSignInAdmin={() => handleOpenAuth("CENTER_ADMIN", "LOGIN")}
              onBackToOverview={() => setActiveTab("dashboard")}
            />
          );
        }
        return <CenterAdminPage />;
      case "platform-admin":
        // RBAC Guard: Only PLATFORM_ADMIN can access Platform DevOps & Telemetry
        if (user && user.role !== "PLATFORM_ADMIN") {
          return (
            <RestrictedAccessGuard
              requiredRole="PLATFORM_ADMIN"
              roleTitle="Platform DevOps & Audit Infrastructure"
              currentRole={user.role}
              onSignInAdmin={() => handleOpenAuth("PLATFORM_ADMIN", "LOGIN")}
              onBackToOverview={() => setActiveTab("dashboard")}
            />
          );
        }
        return <PlatformAdminPage />;
      default:
        return <Dashboard />;
    }
  };

  // Landing / Unauthenticated
  if (viewMode === "landing" || !user) {
    return (
      <div className={`app-canvas theme-${theme || "obsidian"}`}>
        <LandingPage
          onOpenAuth={handleOpenAuth}
          onLaunchDemo={() => setViewMode("app")}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={closeAuthModal}
          onSuccess={() => { closeAuthModal(); setViewMode("app"); }}
          defaultRole={authModalRole}
          defaultTab={authModalTab}
        />
      </div>
    );
  }

  // Authenticated App Shell
  return (
    <div className={`app-canvas theme-${theme || "obsidian"}`} style={{ display: "flex", minHeight: "100vh" }}>
      {/* Ambient orbs */}
      <div className="aurora-orb-1" />
      <div className="aurora-orb-2" />
      <div className="aurora-orb-3" />

      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, padding: "1rem 1.25rem 1rem 1rem", position: "relative", zIndex: 1 }}>
        <Navbar />
        <main style={{ flex: 1, overflowY: "auto" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            {renderPage()}
          </div>
        </main>
      </div>

      {/* Global modals */}
      <CommandPalette />
      <BookingModal />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        onSuccess={() => { closeAuthModal(); }}
        defaultRole={authModalRole}
        defaultTab={authModalTab}
      />
    </div>
  );
}

export default App;
