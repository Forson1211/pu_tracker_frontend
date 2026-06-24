"use client";
import { useState } from "react";
import { predictSimulate } from "@/lib/api";
import { RISK_COLOR, RISK_ICON, RISK_LABEL } from "@/lib/constants";
import { Spinner } from "@/components/ui";

function Slider({ label, value, min, max, step, onChange }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs mb-1.5" style={{ color: "#94a3b8" }}>
        <span>{label}</span>
        <span className="font-bold" style={{ color: "#f1f5f9" }}>{Number(value).toFixed(step < 1 ? 1 : 0)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full outline-none cursor-pointer"
        style={{ accentColor: "#4f7cff", background: "#232b3d" }}
      />
      <div className="flex justify-between text-xs mt-0.5" style={{ color: "#3d4a5f" }}>
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  );
}

export default function WhatIfSimulator({ student, originalPred }) {
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [simResult, setSimResult] = useState(null);
  const [error, setError]     = useState("");

  // Slider state pre-filled from student data
  const [att,  setAtt]  = useState(student.avg_attendance  ?? 3.0);
  const [mark, setMark] = useState(student.avg_total_mark  ?? 55);
  const [ca,   setCa]   = useState(student.avg_ca_score    ?? 22);
  const [exam, setExam] = useState(student.avg_exam_score  ?? 33);
  const [trend,setTrend]= useState(student.gpa_trend       ?? 0);
  const [cf,   setCf]   = useState(student.consec_fails    ?? 0);

  async function runSim() {
    setLoading(true); setError("");
    try {
      const payload = {
        ...student,
        avg_attendance: att, avg_total_mark: mark,
        avg_ca_score: ca,   avg_exam_score: exam,
        gpa_trend: trend,   consec_fails: cf,
        trend_x_fail: trend * cf,
        semester_index: student.semester_index ?? 7,
      };
      const res = await predictSimulate(payload);
      setSimResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const origClass  = originalPred?.risk_class ?? student.risk_class ?? 0;
  const simClass   = simResult?.risk_class;
  const origHighPct = Math.round((originalPred?.prob_high ?? student.prob_high ?? 0) * 100);
  const simHighPct  = simResult ? Math.round(simResult.prob_high * 100) : null;
  const delta       = simResult ? simResult.prob_high - (originalPred?.prob_high ?? student.prob_high ?? 0) : 0;

  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full rounded-xl py-2.5 text-sm font-bold transition-all hover:-translate-y-0.5"
        style={{
          background: open ? "#1a2332" : "linear-gradient(135deg,#4f7cff 0%,#8b5cf6 100%)",
          color: "white", border: open ? "1px solid #2a3344" : "none",
          boxShadow: open ? "none" : "0 6px 18px -8px rgba(79,124,255,.55)",
        }}
      >
        {open ? "✕ Close Simulator" : "🔬 What-If Simulator — Adjust & Re-Predict"}
      </button>

      {open && (
        <div
          className="mt-3 rounded-2xl p-5 fade-up"
          style={{ background: "linear-gradient(135deg,rgba(79,124,255,.08) 0%,#0a0e17 100%)",
                   border: "1px solid rgba(79,124,255,.25)" }}
        >
          <p className="text-xs mb-4 leading-relaxed" style={{ color: "#94a3b8" }}>
            <b className="text-white">🔬 Interactive Simulator</b><br/>
            Adjust the sliders below to see how the prediction changes.
            Use this to identify exactly which improvements would move this student out of the risk zone.
          </p>

          <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
            <Slider label="Attendance (0–5)"       value={att}  min={0}  max={5}  step={0.1} onChange={setAtt}  />
            <Slider label="Avg Total Mark (0–100)" value={mark} min={0}  max={100} step={0.5} onChange={setMark} />
            <Slider label="CA Score (0–40)"        value={ca}   min={0}  max={40}  step={0.5} onChange={setCa}   />
            <Slider label="Exam Score (0–60)"      value={exam} min={0}  max={60}  step={0.5} onChange={setExam} />
            <Slider label="GPA Trend (−2 to +2)"   value={trend}min={-2} max={2}  step={0.05} onChange={setTrend}/>
            <Slider label="Consecutive Fail Sems"  value={cf}   min={0}  max={8}  step={1}   onChange={setCf}   />
          </div>

          <button
            onClick={runSim}
            disabled={loading}
            className="w-full rounded-xl py-2.5 font-bold text-sm text-white mt-2
                       transition-all hover:-translate-y-0.5 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#4f7cff 0%,#8b5cf6 100%)" }}
          >
            {loading ? <span className="flex items-center justify-center gap-2"><Spinner size={4}/> Running...</span>
                     : "▶ Run Simulation"}
          </button>

          {error && (
            <p className="mt-3 text-xs rounded-xl px-3 py-2"
               style={{ background: "#2d0e0e", color: "#fca5a5", border: "1px solid #ef444466" }}>
              {error}
            </p>
          )}

          {simResult && (
            <div className="mt-4 fade-up">
              {/* Side-by-side comparison */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                {[
                  { label: "Current Prediction", rc: origClass, pct: origHighPct },
                  { label: "Simulated Prediction", rc: simClass, pct: simHighPct },
                ].map(({ label, rc, pct }) => (
                  <div key={label} className="rounded-xl p-3 text-center"
                       style={{ background: `${RISK_COLOR[rc]}18`,
                                border: `1px solid ${RISK_COLOR[rc]}44` }}>
                    <div className="text-xs mb-1" style={{ color: "#94a3b8" }}>{label}</div>
                    <div className="text-3xl">{RISK_ICON[rc]}</div>
                    <div className="font-bold text-sm mt-1" style={{ color: RISK_COLOR[rc] }}>
                      {RISK_LABEL[rc]}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                      High Risk: <b style={{ color: RISK_COLOR[rc] }}>{pct}%</b>
                    </div>
                  </div>
                ))}
              </div>

              {/* Insight */}
              {(() => {
                let icon, color, msg;
                if (simClass < origClass) {
                  icon = "✅"; color = "#22c55e";
                  msg = `These changes improve the prediction from ${RISK_LABEL[origClass]} to ${RISK_LABEL[simClass]}. High Risk probability drops by ${Math.abs(Math.round(delta*100))}%.`;
                } else if (simClass > origClass) {
                  icon = "⚠️"; color = "#f59e0b";
                  msg = `These values would worsen the risk to ${RISK_LABEL[simClass]}. High Risk probability rises by ${Math.abs(Math.round(delta*100))}%.`;
                } else {
                  icon = "ℹ️"; color = "#60a5fa";
                  msg = `Risk class stays at ${RISK_LABEL[simClass]}. High Risk probability changes by ${delta >= 0 ? "+" : ""}${Math.round(delta*100)}%.`;
                }
                return (
                  <div className="rounded-xl p-3 text-sm flex gap-2 items-start"
                       style={{ background: `${color}12`, border: `1px solid ${color}44`, color: "#e2e8f0" }}>
                    <span className="text-lg flex-shrink-0">{icon}</span>
                    <span>{msg}</span>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
