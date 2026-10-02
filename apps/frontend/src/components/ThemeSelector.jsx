import React, { useState, useRef, useEffect } from "react";
import { Palette, Check, Sparkles } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { soundFx } from "../shared/soundFx";

const THEMES = [
  {
    id: "obsidian",
    name: "Obsidian Cyber",
    desc: "Deep Space Cyan & Indigo",
    colors: ["#0ea5e9", "#6366f1"],
    accent: "#0ea5e9"
  },
  {
    id: "emerald",
    name: "Emerald Matrix",
    desc: "Bio-Diagnostic Mint & Green",
    colors: ["#10b981", "#14b8a6"],
    accent: "#10b981"
  },
  {
    id: "amethyst",
    name: "Amethyst Nebula",
    desc: "Cosmic Violet & Fuchsia",
    colors: ["#a855f7", "#ec4899"],
    accent: "#a855f7"
  },
];

export const ThemeSelector = () => {
  const { theme, setTheme } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const current = THEMES.find((t) => t.id === theme) || THEMES[0];

  // Apply theme to document element and body on mount & update
  useEffect(() => {
    const currentTheme = theme || "obsidian";
    if (typeof document !== "undefined") {
      document.documentElement.className = `theme-${currentTheme}`;
      document.body.className = `theme-${currentTheme}`;
    }
  }, [theme]);

  // Click outside to close
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelectTheme = (themeId) => {
    soundFx.playSuccess?.();
    setTheme(themeId);
    if (typeof document !== "undefined") {
      document.documentElement.className = `theme-${themeId}`;
      document.body.className = `theme-${themeId}`;
    }
    setIsOpen(false);
  };

  return (
    <div style={{ position: "relative" }} ref={containerRef}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => {
          soundFx.playClick?.();
          setIsOpen((v) => !v);
        }}
        title="Select visual theme"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "7px 12px",
          borderRadius: 10,
          cursor: "pointer",
          background: "var(--c-surface, rgba(7,12,22,0.85))",
          border: `1px solid ${isOpen ? "var(--c-accent-border, rgba(14,165,233,0.4))" : "var(--c-border, rgba(255,255,255,0.1))"}`,
          color: "#e2e8f0",
          fontSize: 12,
          fontWeight: 600,
          transition: "all 0.18s ease",
          whiteSpace: "nowrap",
          boxShadow: isOpen ? "0 0 12px var(--c-accent-dim, rgba(14,165,233,0.2))" : "none",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--c-accent-border, rgba(14,165,233,0.4))";
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = "var(--c-border, rgba(255,255,255,0.1))";
          }
        }}
      >
        {/* Color preview dots */}
        <div style={{ display: "flex", alignItems: "center" }}>
          {current.colors.map((c, i) => (
            <span
              key={i}
              style={{
                width: 9,
                height: 9,
                borderRadius: "50%",
                background: c,
                border: "1.5px solid rgba(7,12,22,0.9)",
                marginLeft: i > 0 ? -3 : 0,
                display: "inline-block",
                boxShadow: `0 0 4px ${c}60`,
              }}
            />
          ))}
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#cbd5e1" }}>{current.name.split(" ")[0]}</span>
        <Palette size={13} color="var(--c-accent, #0ea5e9)" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            zIndex: 9999,
            width: 250,
            borderRadius: 16,
            background: "var(--c-surface, rgba(6,10,20,0.98))",
            border: "1px solid var(--c-border-2, rgba(255,255,255,0.15))",
            boxShadow: "0 24px 64px rgba(0,0,0,0.85), 0 4px 16px rgba(0,0,0,0.5)",
            backdropFilter: "blur(24px)",
            padding: 6,
            animation: "themeDrop 0.15s ease",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "8px 12px 10px",
              borderBottom: "1px solid var(--c-border, rgba(255,255,255,0.07))",
              marginBottom: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: 9,
                fontFamily: "JetBrains Mono, monospace",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#64748b",
              }}
            >
              Enterprise Visual Engine
            </span>
            <Sparkles size={11} color="var(--c-accent, #0ea5e9)" />
          </div>

          {/* Options */}
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {THEMES.map((t) => {
              const active = theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelectTheme(t.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    padding: "9px 12px",
                    borderRadius: 11,
                    cursor: "pointer",
                    background: active ? "var(--c-accent-dim, rgba(14,165,233,0.12))" : "transparent",
                    border: `1px solid ${active ? "var(--c-accent-border, rgba(14,165,233,0.35))" : "transparent"}`,
                    textAlign: "left",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                      {/* Color preview */}
                      <div style={{ display: "flex" }}>
                        {t.colors.map((c, i) => (
                          <span
                            key={i}
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              background: c,
                              border: "1.5px solid rgba(6,10,20,0.9)",
                              marginLeft: i > 0 ? -3 : 0,
                              display: "inline-block",
                              boxShadow: `0 0 5px ${c}80`,
                            }}
                          />
                        ))}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{t.name}</span>
                    </div>
                    <p style={{ fontSize: 10, color: "#64748b", margin: 0, paddingLeft: 18 }}>{t.desc}</p>
                  </div>
                  {active && <Check size={14} color={t.accent} style={{ flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        @keyframes themeDrop {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};
