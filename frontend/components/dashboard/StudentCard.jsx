"use client";
import { useState } from "react";
import { RISK_COLOR, RISK_BG, RISK_ICON, RISK_LABEL, RISK_MEANING,
         FACULTY_FULL, GRAD_CLASSES } from "@/lib/constants";
import { ProgressBar, StatTile } from "@/components/ui";
import { ProbBar } from "@/components/charts/Charts";
import WhatIfSimulator from "./WhatIfSimulator";
import { downloadStudentPdf } from "@/lib/api";

function getInitials(name = "") {
  return name.trim().split(" ").slice(0,2).map(p => p[0]?.toUpperCase()).join("") || "?";
}

function getGradClass(cgpa) {
  for (const g of GRAD_CLASSES) {
    if (cgpa >= g.min && cgpa <= g.max) return g;
  }
  return { label:"Fail", color:"#ef4444", emoji:"❌" };
}

export default function StudentCard({ student, defaultOpen = false }) {
  const [open, setOpen]           = useState(defaultOpen);
  const [pdfLoading, setPdfLoading] = useState(false);

  const rc     = student.risk_class ?? 0;
  const color  = RISK_COLOR[rc];
  const bg     = RISK_BG[rc];
  const name   = student.name || "Unknown Student";
  const sid    = student.student_id || "";
  const fac    = student.faculty || "";
  const sem    = student.semester || "";
  const gpa    = student.semester_gpa ?? 0;

  const gpaDir = student.gpa_trend > 0.05 ? `📈 +${student.gpa_trend?.toFixed(2)}`
               : student.gpa_trend < -0.05 ? `📉 ${student.gpa_trend?.toFixed(2)}`
               : "➡️ Stable";

  async function handlePdf() {
    setPdfLoading(true);
    try { await downloadStudentPdf(student); }
    catch (e) { alert("PDF error: " + e.message); }
    finally { setPdfLoading(false); }
  }

  return (
    <div
      className="rounded-2xl mb-2 overflow-hidden transition-all"
      style={{
        background: "linear-gradient(160deg,#131a26 0%,#0f1626 100%)",
        border: "1px solid #232b3d",
        borderLeft: `4px solid ${color}`,
      }}
    >
      {/* Header row — always visible */}
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[.02] transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm
                     font-extrabold text-white flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#4f7cff,#8b5cf6)" }}
        >
          {getInitials(name)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate" style={{ color: "#f1f5f9" }}>
            {name} {sid ? <span style={{ color: "#64748b" }}>({sid})</span> : null}
          </div>
          <div className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
            {FACULTY_FULL[fac] || fac} · {sem} · GPA{" "}
            <span className="font-bold" style={{ color }}>{gpa?.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span
            className="hidden sm:inline text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: bg, color, border: `1px solid ${color}66` }}
          >
            {RISK_ICON[rc]} {RISK_LABEL[rc]}
          </span>
          <span className="text-xs" style={{ color: "#64748b" }}>
            {student.prob_high ? `${Math.round(student.prob_high*100)}%` : ""}
          </span>
          <span style={{ color: "#64748b", fontSize: 12 }}>{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {/* Expanded detail */}
      {open && (
        <div className="border-t px-4 pb-5 pt-4 fade-up" style={{ borderColor: "#1c2436" }}>

          {/* Profile row */}
          <div className="flex items-center gap-3 mb-4 pb-4"
               style={{ borderBottom: "1px solid #1c2436" }}>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-lg
                         font-extrabold text-white flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#4f7cff,#8b5cf6)" }}
            >
              {getInitials(name)}
            </div>
            <div className="flex-1">
              <div className="font-bold" style={{ color: "#f1f5f9" }}>{name}</div>
              <div className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                🆔 {sid} · 🏛️ {fac} · {student.gender} · {sem}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-extrabold" style={{ color }}>{gpa?.toFixed(2)}</div>
              <div className="text-xs" style={{ color: "#94a3b8" }}>GPA</div>
            </div>
          </div>

          {/* Probability bar */}
          <div className="mb-4">
            <p className="text-xs font-semibold mb-2" style={{ color: "#94a3b8" }}>Prediction Probabilities</p>
            <ProbBar
              probLow={student.prob_low ?? 0}
              probMed={student.prob_med ?? 0}
              probHigh={student.prob_high ?? 0}
            />
          </div>

          {/* Performance bars */}
          <p className="text-xs font-bold uppercase tracking-widest mb-2 mt-4" style={{ color: "#f1f5f9" }}>
            📊 Academic Performance
          </p>
          <div className="grid grid-cols-2 gap-x-6">
            <div>
              <ProgressBar label="Total Mark"  value={student.avg_total_mark} max={100} color="#60a5fa" />
              <ProgressBar label="CA Score"    value={student.avg_ca_score}   max={40}  color="#22c55e" />
            </div>
            <div>
              <ProgressBar label="Exam Score"  value={student.avg_exam_score} max={60}  color="#f59e0b" />
              <ProgressBar label="Attendance"  value={student.avg_attendance} max={5}   color="#a78bfa" />
            </div>
          </div>

          {/* Key facts grid */}
          <p className="text-xs font-bold uppercase tracking-widest mb-2 mt-4" style={{ color: "#f1f5f9" }}>
            🔍 Key Facts
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <StatTile icon="📊" label="Previous GPA"     value={`${student.prev_gpa?.toFixed(2)} / 4.00`} />
            <StatTile icon="📈" label="GPA Direction"    value={gpaDir} />
            <StatTile icon="⚠️" label="Sems Below 1.5"  value={student.consec_fails ?? 0} />
            <StatTile icon="📚" label="Credits"          value={student.total_credits ?? 0} />
            <StatTile icon="🎯" label="Courses"          value={student.num_courses ?? 0} />
            <StatTile icon="🤖" label="Confidence"       value={`${Math.round((student.prob_high ?? 0)*100)}%`}
                      valueColor={color} />
          </div>

          {/* What this means */}
          <div
            className="rounded-xl p-3 mt-4 flex gap-2 items-start text-sm"
            style={{ background: bg, border: `1px solid ${color}66` }}
          >
            <span className="text-2xl flex-shrink-0">{RISK_ICON[rc]}</span>
            <div>
              <b style={{ color }}>What this means</b><br/>
              <span style={{ color: "#e2e8f0" }}>{RISK_MEANING[rc]}</span>
            </div>
          </div>

          {/* Recommendations */}
          {student.recommendations?.length > 0 && (
            <>
              <p className="text-xs font-bold uppercase tracking-widest mb-2 mt-4" style={{ color: "#f1f5f9" }}>
                💡 Recommended Actions
              </p>
              {student.recommendations.map((rec, i) => {
                const recColor = rec.icon === "🔴" ? "#ef4444"
                               : rec.icon === "🟡" ? "#f59e0b" : "#22c55e";
                return (
                  <div key={i} className="rounded-xl p-3 mb-2 flex gap-2 items-start text-xs"
                       style={{ background: "linear-gradient(160deg,#131a26 0%,#0a0e17 100%)",
                                border: "1px solid #232b3d", borderLeft: `3px solid ${recColor}` }}>
                    <span className="flex-shrink-0">{rec.icon}</span>
                    <span style={{ color: "#cbd5e1" }}>{rec.text}</span>
                  </div>
                );
              })}
            </>
          )}

          {/* Graduation projection */}
          {student.level && (student.level === "Level 300" || student.level === "Level 400") &&
           student.cumulative_gpa != null && (() => {
            const gc = getGradClass(Number(student.cumulative_gpa));
            return (
              <>
                <p className="text-xs font-bold uppercase tracking-widest mb-2 mt-4" style={{ color: "#f1f5f9" }}>
                  🎓 Graduation Projection ({student.level})
                </p>
                <div className="rounded-xl p-3" style={{ background: `${gc.color}18`,
                     border: `1px solid ${gc.color}44`, borderTop: `3px solid ${gc.color}` }}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{gc.emoji}</span>
                    <div>
                      <div className="font-bold" style={{ color: "#f1f5f9" }}>{gc.label}</div>
                      <div className="text-xs" style={{ color: "#94a3b8" }}>
                        Current CGPA:{" "}
                        <b style={{ color: gc.color }}>{Number(student.cumulative_gpa).toFixed(2)}</b>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}

          {/* What-If Simulator */}
          <WhatIfSimulator student={student} originalPred={null} />

          {/* PDF download */}
          <div className="mt-4">
            <button
              onClick={handlePdf}
              disabled={pdfLoading}
              className="w-full rounded-xl py-2.5 text-sm font-semibold transition-all
                         hover:-translate-y-0.5 disabled:opacity-50"
              style={{ background: "#1a2332", border: "1px solid #232b3d", color: "#f1f5f9" }}
            >
              {pdfLoading ? "⏳ Generating PDF..." : "📄 Download PDF Report"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
