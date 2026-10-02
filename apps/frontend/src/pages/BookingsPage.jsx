import React, { useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { formatCurrency, formatDate } from "../shared/utils";
import {
  CalendarCheck, Clock, Building2, XCircle,
  QrCode, ShieldCheck, Zap
} from "lucide-react";
import { soundFx } from "../shared/soundFx";

const STATUS_MAP = {
  CONFIRMED:   { cls: "confirmed",   label: "Confirmed"   },
  PENDING:     { cls: "pending",     label: "Pending"     },
  CANCELLED:   { cls: "cancelled",   label: "Cancelled"   },
  FAILED:      { cls: "failed",      label: "Failed"      },
  COMPLETED:   { cls: "completed",   label: "Completed"   },
  RESCHEDULED: { cls: "rescheduled", label: "Rescheduled" },
};

export const BookingsPage = () => {
  const { bookings, updateBookingStatus, setActiveTab, setPendingCheckoutBooking, openBookingModal } = useAppStore();
  const [filter, setFilter] = useState("ALL");

  const displayed = bookings.filter((b) => filter === "ALL" || b.status === filter);
  const confirmed  = bookings.filter((b) => b.status === "CONFIRMED").length;
  const pending    = bookings.filter((b) => b.status === "PENDING").length;
  const totalSpend = bookings.filter((b) => ["CONFIRMED","COMPLETED"].includes(b.status)).reduce((a, c) => a + c.amount, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 64 }}>

      {/* Header */}
      <div style={{ paddingBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <span className="pill-tag pill-teal" style={{ width: "fit-content", marginBottom: 10, display: "inline-flex" }}>Concurrency-Safe Engine</span>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#f1f5f9", margin: "4px 0 8px", letterSpacing: "-0.03em", display: "flex", alignItems: "center", gap: 12 }}>
              <CalendarCheck size={24} color="#0ea5e9" /> My Bookings
            </h1>
            <p style={{ fontSize: 13, color: "#64748b", margin: 0, maxWidth: 500 }}>
              Manage reservations, verify gateway transactions, and checkout pending slots.
            </p>
          </div>

          {/* Summary pills */}
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { label: "Total", value: bookings.length, color: "#e2e8f0" },
              { label: "Confirmed", value: confirmed, color: "#34d399" },
              { label: "Pending", value: pending, color: "#fbbf24" },
              { label: "Total Paid", value: formatCurrency(totalSpend), color: "#38bdf8" },
            ].map((s) => (
              <div key={s.label} style={{ background: "rgba(11,17,33,0.8)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "12px 18px", minWidth: 90, textAlign: "center" }}>
                <p style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#334155", margin: "0 0 4px" }}>{s.label}</p>
                <p style={{ fontSize: 20, fontWeight: 800, color: s.color, margin: 0, letterSpacing: "-0.02em" }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {["ALL","CONFIRMED","PENDING","COMPLETED","CANCELLED"].map((s) => (
          <button
            key={s}
            onClick={() => { soundFx.playClick?.(); setFilter(s); }}
            style={{
              padding: "7px 16px", borderRadius: 99, fontSize: 12, fontWeight: 600,
              cursor: "pointer", transition: "all 0.15s ease", whiteSpace: "nowrap", border: "1px solid",
              background: filter === s ? "linear-gradient(135deg, #0ea5e9, #6366f1)" : "rgba(11,17,33,0.8)",
              borderColor: filter === s ? "rgba(14,165,233,0.5)" : "rgba(255,255,255,0.08)",
              color: filter === s ? "white" : "#64748b",
              boxShadow: filter === s ? "0 4px 14px rgba(14,165,233,0.2)" : "none"
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Booking rows */}
      {displayed.length === 0 ? (
        <div className="empty-state">
          <CalendarCheck size={40} color="#1e293b" />
          <p style={{ fontWeight: 700, color: "#e2e8f0", margin: "14px 0 6px", fontSize: 15 }}>No appointments found</p>
          <p style={{ fontSize: 13, color: "#475569", margin: "0 0 20px" }}>
            No bookings matching &quot;{filter}&quot; — browse partner labs to schedule a test.
          </p>
          <button className="btn-primary" style={{ fontSize: 12 }} onClick={() => { soundFx.playClick?.(); setActiveTab("centers"); }}>Browse Diagnostic Labs</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {displayed.map((b) => {
            const s = STATUS_MAP[b.status] || STATUS_MAP.PENDING;
            return (
              <div
                key={b.id}
                className="row-item"
                style={{ flexWrap: "wrap", gap: 16, padding: "20px 24px" }}
              >
                {/* Info */}
                <div style={{ flex: 1, minWidth: 220, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span className={`status-pill ${s.cls}`}>{s.label}</span>
                    <span className="mono-label">#{b.id?.slice(-10)}</span>
                    {b.payment?.gatewayPaymentId && (
                      <span className="mono-label">Pay: {b.payment.gatewayPaymentId}</span>
                    )}
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>{b.test?.name || "Diagnostic Assay"}</h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}><Building2 size={12} color="#0ea5e9" />{b.center?.name}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}><Clock size={12} color="#8b5cf6" />{formatDate(b.appointmentDate)}</span>
                  </div>
                </div>

                {/* Amount + Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 3px" }}>Amount</p>
                    <p style={{ fontSize: 24, fontWeight: 800, color: "#f1f5f9", margin: 0, letterSpacing: "-0.03em" }}>{formatCurrency(b.amount)}</p>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {b.status === "PENDING" && (
                      <>
                        <button
                          className="btn-primary"
                          style={{ fontSize: 12 }}
                          onClick={() => { soundFx.playClick?.(); setPendingCheckoutBooking(b); setActiveTab("payment-checkout"); }}
                        >
                          <QrCode size={13} /> Pay Now
                        </button>
                        <button
                          className="btn-success"
                          onClick={() => { soundFx.playClick?.(); updateBookingStatus(b.id, "CONFIRMED"); }}
                        >
                          <Zap size={13} /> Simulate
                        </button>
                      </>
                    )}
                    {!["CANCELLED","COMPLETED"].includes(b.status) && (
                      <button
                        className="btn-danger"
                        onClick={() => { soundFx.playClick?.(); if (confirm("Cancel this appointment?")) updateBookingStatus(b.id, "CANCELLED"); }}
                      >
                        <XCircle size={13} /> Cancel
                      </button>
                    )}
                    <button
                      className="btn-ghost"
                      style={{ fontSize: 12 }}
                      onClick={() => { soundFx.playClick?.(); if (b.center && b.test) openBookingModal(b.center, b.test); }}
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
