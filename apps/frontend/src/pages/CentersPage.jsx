import React, { useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { formatCurrency } from "../shared/utils";
import {
  Building2, Search, MapPin, Phone, Mail,
  Clock, ShieldCheck, AlertCircle, Zap, ChevronRight
} from "lucide-react";
import { soundFx } from "../shared/soundFx";

const CATEGORIES = ["ALL", "Hematology", "Endocrinology", "Cardiology", "Hepatology", "Nephrology", "Vitamin & Wellness"];

export const CentersPage = () => {
  const { centers, openBookingModal } = useAppStore();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("ALL");

  const filtered = centers.map((c) => ({
    ...c,
    tests: c.tests?.filter((t) => {
      const matchQ = t.name.toLowerCase().includes(query.toLowerCase()) || c.name.toLowerCase().includes(query.toLowerCase());
      const matchC = cat === "ALL" || t.category === cat;
      return matchQ && matchC;
    }),
  })).filter((c) => (c.tests?.length || 0) > 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, paddingBottom: 64 }}>
      {/* Header */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <span className="pill-tag pill-teal" style={{ width: "fit-content" }}>NABL Accredited Network</span>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#f1f5f9", margin: "6px 0 6px", letterSpacing: "-0.03em", display: "flex", alignItems: "center", gap: 12 }}>
              <Building2 size={24} color="#0ea5e9" />
              Diagnostic Labs
            </h1>
            <p style={{ fontSize: 13, color: "#64748b", margin: 0, maxWidth: 480 }}>
              Reserve certified clinical assays with atomic Redis slot locking — zero double-booking guaranteed.
            </p>
          </div>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <Search size={14} color="#475569" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input
              className="input-premium"
              type="text"
              placeholder="Search assays or labs..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ paddingLeft: 42, width: 280, fontSize: 13 }}
            />
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => { soundFx.playClick?.(); setCat(c); }}
            style={{
              padding: "7px 16px", borderRadius: 99, fontSize: 12, fontWeight: 600,
              cursor: "pointer", transition: "all 0.15s ease", whiteSpace: "nowrap",
              border: "1px solid",
              background: cat === c ? "linear-gradient(135deg, #0ea5e9, #6366f1)" : "rgba(11,17,33,0.8)",
              borderColor: cat === c ? "rgba(14,165,233,0.5)" : "rgba(255,255,255,0.08)",
              color: cat === c ? "white" : "#64748b",
              boxShadow: cat === c ? "0 4px 16px rgba(14,165,233,0.2)" : "none"
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Centers */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <Building2 size={40} color="#1e293b" />
          <p style={{ fontWeight: 700, color: "#e2e8f0", margin: "14px 0 6px", fontSize: 15 }}>No labs found</p>
          <p style={{ fontSize: 13, color: "#475569", margin: 0 }}>Try adjusting the search or category filter.</p>
        </div>
      ) : (
        filtered.map((center) => (
          <div key={center.id} className="glass-card" style={{ overflow: "hidden" }}>
            {/* Lab Header */}
            <div style={{ padding: "24px 28px", background: "rgba(7,12,22,0.5)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: "#f1f5f9", margin: 0, letterSpacing: "-0.02em" }}>{center.name}</h2>
                    <span className="pill-tag pill-emerald">
                      <ShieldCheck size={9} /> NABL Certified
                    </span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}><MapPin size={12} color="#0ea5e9" />{center.location}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}><Mail size={12} color="#475569" />{center.contactEmail}</span>
                    {center.contactPhone && <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}><Phone size={12} color="#475569" />{center.contactPhone}</span>}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p className="section-label">Available Assays</p>
                  <p style={{ fontSize: 20, fontWeight: 800, color: "#0ea5e9", margin: "4px 0 0", letterSpacing: "-0.02em" }}>{center.tests?.length || 0} online</p>
                </div>
              </div>
            </div>

            {/* Tests Grid */}
            <div style={{ padding: "24px 28px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {center.tests?.map((test) => (
                <div
                  key={test.id}
                  style={{
                    background: "rgba(7,12,22,0.6)", border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 16, padding: "20px 22px",
                    display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16,
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(14,165,233,0.25)"; e.currentTarget.style.background = "rgba(14,165,233,0.04)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(7,12,22,0.6)"; }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                      <span className="pill-tag pill-teal">{test.category || "General Wellness"}</span>
                      <span style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.03em" }}>{formatCurrency(test.price)}</span>
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", margin: "0 0 8px" }}>{test.name}</h3>
                    <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6, margin: "0 0 12px" }}>{test.description}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#475569", fontFamily: "JetBrains Mono, monospace" }}>
                      <Clock size={11} color="#0ea5e9" /> {test.durationMin} min collection
                    </div>
                    {test.prepInstructions && (
                      <div className="alert-amber" style={{ marginTop: 12 }}>
                        <AlertCircle size={13} color="#f59e0b" style={{ flexShrink: 0, marginTop: 1 }} />
                        <span>{test.prepInstructions}</span>
                      </div>
                    )}
                  </div>
                  <button
                    className="btn-primary"
                    style={{ width: "100%", justifyContent: "center", fontSize: 13 }}
                    onClick={() => { soundFx.playClick?.(); openBookingModal(center, test); }}
                  >
                    <Zap size={13} /> Lock Slot & Book <ChevronRight size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
