"use client";
import { RISK_COLOR, RISK_BG, RISK_ICON, RISK_LABEL } from "@/lib/constants";

// ── Card shell ────────────────────────────────────────────────────────────
export function Card({ children, className = "", style = {} }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background: "linear-gradient(160deg,#131a26 0%,#0f1626 100%)",
        border: "1px solid #232b3d",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── KPI summary card ──────────────────────────────────────────────────────
export function SummaryCard({ icon, value, label, sub, color }) {
  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden transition-transform hover:-translate-y-1"
      style={{
        background: "linear-gradient(160deg,#131a26 0%,#0f1626 100%)",
        border: "1px solid #232b3d",
        borderTop: `3px solid ${color}`,
        boxShadow: `0 12px 28px -16px ${color}55`,
      }}
    >
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-4xl font-extrabold tracking-tight" style={{ color }}>
        {value}
      </div>
      <div className="text-xs font-semibold uppercase tracking-widest mt-1"
           style={{ color: "#94a3b8" }}>
        {label}
      </div>
      {sub && <div className="text-xs mt-1" style={{ color: "#64748b" }}>{sub}</div>}
    </div>
  );
}

// ── Risk badge ────────────────────────────────────────────────────────────
export function RiskBadge({ riskClass }) {
  const color = RISK_COLOR[riskClass];
  const bg    = RISK_BG[riskClass];
  return (
    <span
      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
      style={{ background: bg, color, border: `1px solid ${color}66` }}
    >
      {RISK_ICON[riskClass]} {RISK_LABEL[riskClass]}
    </span>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────
export function ProgressBar({ label, value, max, color }) {
  const pct = Math.min((value / max) * 100, 100);
  const ok  = pct >= 50 ? "✅" : pct >= 40 ? "⚠️" : "🚨";
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1" style={{ color: "#94a3b8" }}>
        <span>{ok} {label}</span>
        <span style={{ color, fontWeight: 700 }}>{value?.toFixed(1)} / {max}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: "#1c2436" }}>
        <div
          className="h-full rounded-full prog-bar"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg,${color}aa,${color})` }}
        />
      </div>
    </div>
  );
}

// ── Section heading ───────────────────────────────────────────────────────
export function SectionTitle({ children }) {
  return (
    <p
      className="font-bold text-sm mb-3"
      style={{ color: "#f1f5f9", borderLeft: "3px solid #4f7cff", paddingLeft: "0.6rem" }}
    >
      {children}
    </p>
  );
}

// ── Insight card ──────────────────────────────────────────────────────────
export function InsightCard({ icon, color, headline, detail }) {
  return (
    <div
      className="rounded-xl p-4 h-full"
      style={{
        background: "linear-gradient(160deg,#131a26 0%,#0a0e17 100%)",
        border: "1px solid #232b3d",
        borderLeft: `4px solid ${color}`,
      }}
    >
      <div className="font-bold text-sm mb-1" style={{ color: "#f1f5f9" }}>
        {icon} {headline}
      </div>
      <div className="text-xs leading-relaxed" style={{ color: "#94a3b8" }}>
        {detail}
      </div>
    </div>
  );
}

// ── Alert box ─────────────────────────────────────────────────────────────
export function AlertBox({ level, title, message }) {
  const map = {
    red:   { bg:"#2d0e0e", border:"#ef4444", color:"#fca5a5" },
    amber: { bg:"#2e2208", border:"#f59e0b", color:"#fde68a" },
    green: { bg:"#102a1c", border:"#22c55e", color:"#86efac" },
    blue:  { bg:"#0d1f2b", border:"#60a5fa", color:"#93c5fd" },
  };
  const s = map[level] || map.blue;
  return (
    <div
      className="rounded-xl p-3 mb-2 text-sm"
      style={{ background: s.bg, border: `1px solid ${s.border}`,
               borderLeft: `4px solid ${s.border}`, color: s.color }}
    >
      <span className="font-bold">{title}</span>
      {message && <span className="opacity-90"> — {message}</span>}
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────
export function Spinner({ size = 6 }) {
  return (
    <span
      className={`inline-block w-${size} h-${size} rounded-full border-2 border-t-transparent spin`}
      style={{ borderColor: "#4f7cff", borderTopColor: "transparent" }}
    />
  );
}

// ── Gradient button ───────────────────────────────────────────────────────
export function GradBtn({ children, onClick, disabled, className = "", type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl px-5 py-2.5 font-bold text-sm text-white
                  transition-all hover:-translate-y-0.5 active:translate-y-0
                  disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{ background: "linear-gradient(135deg,#4f7cff 0%,#8b5cf6 100%)",
               boxShadow: disabled ? "none" : "0 6px 18px -8px rgba(79,124,255,.55)" }}
    >
      {children}
    </button>
  );
}

// ── Ghost button ──────────────────────────────────────────────────────────
export function GhostBtn({ children, onClick, className = "", type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`rounded-xl px-4 py-2 font-semibold text-sm transition-all
                  hover:-translate-y-0.5 hover:border-blue-500 ${className}`}
      style={{ background: "#1a2332", border: "1px solid #232b3d", color: "#f1f5f9" }}
    >
      {children}
    </button>
  );
}

// ── Stat tile (used in student detail) ───────────────────────────────────
export function StatTile({ icon, label, value, valueColor = "#f1f5f9" }) {
  return (
    <div
      className="rounded-xl p-3"
      style={{ background: "#0e1421", border: "1px solid #232b3d" }}
    >
      <div className="text-xs uppercase tracking-widest mb-1 flex items-center gap-1"
           style={{ color: "#94a3b8" }}>
        <span>{icon}</span> {label}
      </div>
      <div className="text-base font-bold" style={{ color: valueColor }}>
        {value}
      </div>
    </div>
  );
}
