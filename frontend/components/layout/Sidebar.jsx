"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useAppStore from "@/store/useAppStore";
import { FACULTY_FULL, FAC_COLOR } from "@/lib/constants";

export default function Sidebar() {
  const router = useRouter();
  const { user, batchResult, clearAuth, activeTab, setActiveTab } = useAppStore();
  const [howOpen, setHowOpen] = useState(false);

  if (!user) return null;

  const { faculty, role, icon, tabs } = user;
  const facColor = faculty ? FAC_COLOR[faculty] : "#60a5fa";

  const n     = batchResult?.summary?.n ?? 0;
  const n_hr  = batchResult?.summary?.n_high ?? 0;
  const n_mr  = batchResult?.summary?.n_medium ?? 0;
  const n_lr  = batchResult?.summary?.n_low ?? 0;

  const tabDefs = [
    { key:"predict",   icon:"🔍", label:"Predict Risk",      visible: tabs.includes("predict") },
    { key:"analytics", icon:"📊", label:"Faculty Analytics", visible: tabs.includes("analytics") },
    { key:"batch",     icon:"📂", label:"Batch Inference",   visible: tabs.includes("batch") },
  ].filter(t => t.visible);

  function signOut() {
    clearAuth();
    router.replace("/login");
  }

  return (
    <aside
      className="w-64 min-h-screen flex flex-col px-4 py-6"
      style={{ background: "linear-gradient(180deg,#0d1320 0%,#0a0e17 100%)",
               borderRight: "1px solid #232b3d" }}
    >
      {/* Logo */}
      <div className="text-center mb-6">
        <div
          className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center text-3xl"
          style={{ background: "linear-gradient(135deg,#4f7cff 0%,#8b5cf6 100%)",
                   boxShadow: "0 8px 22px -8px rgba(79,124,255,.55)" }}
        >
          {icon}
        </div>
        <div className="font-bold text-sm text-white">{role.split(" — ")[0]}</div>
        <div
          className="text-xs mt-1 px-3 py-0.5 rounded-full inline-block"
          style={{ background: `${facColor}18`, color: facColor, border: `1px solid ${facColor}44` }}
        >
          {faculty ? `${faculty} — ${FACULTY_FULL[faculty]?.slice(0, 22)}...` : "All Faculties"}
        </div>
      </div>

      <div className="h-px mb-5" style={{ background: "#232b3d" }} />

      {/* Navigation */}
      <nav className="space-y-1 mb-5">
        {tabDefs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                       font-medium transition-all text-left"
            style={activeTab === t.key
              ? { background: "rgba(79,124,255,.18)", color: "#60a5fa",
                  border: "1px solid rgba(79,124,255,.3)" }
              : { color: "#94a3b8", border: "1px solid transparent" }}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </nav>

      <div className="h-px mb-5" style={{ background: "#232b3d" }} />

      {/* Risk thresholds */}
      <div className="mb-5">
        <p className="text-xs uppercase tracking-widest mb-2 font-semibold"
           style={{ color: "#64748b" }}>
          Risk Thresholds
        </p>
        {[
          { emoji:"🔴", label:"High Risk",   range:"GPA < 2.0",     color:"#ef4444" },
          { emoji:"🟡", label:"Medium Risk", range:"GPA 2.0–2.99",  color:"#f59e0b" },
          { emoji:"🟢", label:"Low Risk",    range:"GPA ≥ 3.0",     color:"#22c55e" },
        ].map(r => (
          <div
            key={r.label}
            className="flex items-center justify-between rounded-lg px-2.5 py-1.5 mb-1 text-xs"
            style={{ background: "#131a26", border: "1px solid #232b3d",
                     borderLeft: `3px solid ${r.color}` }}
          >
            <span style={{ color: "#f1f5f9" }}>{r.emoji} <b>{r.label}</b></span>
            <span style={{ color: "#64748b" }}>{r.range}</span>
          </div>
        ))}
      </div>

      {/* Dataset loaded pill */}
      {batchResult && n > 0 && (
        <>
          <div className="h-px mb-4" style={{ background: "#232b3d" }} />
          <div
            className="rounded-xl p-3 mb-4 text-xs"
            style={{ background: "linear-gradient(160deg,#102a1c 0%,#0a0e17 100%)",
                     border: "1px solid #22c55e44" }}
          >
            <div className="font-bold mb-1" style={{ color: "#22c55e" }}>
              ✅ Dataset Loaded
            </div>
            <div style={{ color: "#94a3b8" }}>{n.toLocaleString()} students analysed</div>
            <div className="mt-2 space-y-0.5 leading-loose">
              <div>🔴 <b style={{ color:"#ef4444" }}>{n_hr}</b> need immediate attention</div>
              <div>🟡 <b style={{ color:"#f59e0b" }}>{n_mr}</b> need monitoring</div>
              <div>🟢 <b style={{ color:"#22c55e" }}>{n_lr}</b> on track</div>
            </div>
          </div>
        </>
      )}

      {/* How to use */}
      <div className="mb-4">
        <button
          onClick={() => setHowOpen(v => !v)}
          className="w-full text-left text-xs font-semibold rounded-xl px-3 py-2.5 transition-all"
          style={{ background: "#131a26", border: "1px solid #232b3d", color: "#94a3b8" }}
        >
          {howOpen ? "▾" : "▸"} How to use this system
        </button>
        {howOpen && (
          <div
            className="mt-1 rounded-b-xl p-3 text-xs leading-relaxed"
            style={{ background: "#0d1320", border: "1px solid #232b3d",
                     borderTop: "none", color: "#94a3b8" }}
          >
            <p className="mb-2">
              <b className="text-white">Step 1 — Upload data</b><br/>
              Go to <b>Batch Inference</b> and upload a CSV with your students.
            </p>
            <p className="mb-2">
              <b className="text-white">Step 2 — View predictions</b><br/>
              The system identifies who needs attention automatically.
            </p>
            <p>
              <b className="text-white">Step 3 — Take action</b><br/>
              Click any student for recommendations and PDF reports.
            </p>
          </div>
        )}
      </div>

      <div className="mt-auto">
        <div className="h-px mb-4" style={{ background: "#232b3d" }} />
        <button
          onClick={signOut}
          className="w-full rounded-xl py-2.5 text-sm font-semibold transition-all
                     hover:brightness-110"
          style={{ background: "#1a2332", border: "1px solid #232b3d", color: "#94a3b8" }}
        >
          Sign Out
        </button>
        <p className="text-center text-xs mt-3" style={{ color: "#3d4a5f" }}>
          Ghana DPA 2012 Compliant
        </p>
      </div>
    </aside>
  );
}
