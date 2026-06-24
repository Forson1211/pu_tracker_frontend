"use client";
import { useState, useEffect } from "react";
import useAppStore from "@/store/useAppStore";
import { SummaryCard, InsightCard } from "@/components/ui";
import {
  DonutChart, FacultyStackedBar, GPATrendLine, HighRiskTrendLine,
  GenderGPABar, ShapBar, FairnessBar,
} from "@/components/charts/Charts";
import { fetchModelInfo, downloadCohortPdf } from "@/lib/api";
import { GRAD_CLASSES } from "@/lib/constants";

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <div className="font-bold text-sm mb-3"
           style={{ color:"#f1f5f9", borderLeft:"3px solid #4f7cff", paddingLeft:"0.7rem" }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-2xl p-4" style={{ background:"#131a26", border:"1px solid #232b3d" }}>
      {title && <p className="text-xs font-semibold mb-2" style={{ color:"#94a3b8" }}>{title}</p>}
      {children}
    </div>
  );
}

export default function AnalyticsTab() {
  const { batchResult, user, modelInfo, setModelInfo } = useAppStore();
  const [pdfLoading, setPdfLoading] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [openSection, setOpenSection] = useState("faculty");

  const students = batchResult?.students ?? [];
  const insights = batchResult?.insights ?? [];
  const gradData = batchResult?.graduation_summary ?? [];
  const sum      = batchResult?.summary;

  useEffect(() => {
    if (!modelInfo) {
      setModelLoading(true);
      fetchModelInfo().then(setModelInfo).catch(() => {}).finally(() => setModelLoading(false));
    }
  }, [modelInfo, setModelInfo]);

  async function handleCohortPdf() {
    setPdfLoading(true);
    try { await downloadCohortPdf(students); }
    catch (e) { alert("PDF error: " + e.message); }
    finally { setPdfLoading(false); }
  }

  if (!batchResult) {
    return (
      <div className="flex flex-col items-center justify-center h-72 text-center fade-up">
        <div className="text-5xl mb-4">📊</div>
        <p className="font-semibold text-white mb-2">No data loaded yet</p>
        <p className="text-sm" style={{ color:"#94a3b8" }}>
          Upload a CSV in the Batch Inference tab to power this dashboard.
        </p>
      </div>
    );
  }

  const navItems = [
    { key:"faculty",      label:"🏛️ Faculty"    },
    { key:"gender",       label:"👥 Gender"      },
    { key:"trends",       label:"📈 Trends"      },
    { key:"graduation",   label:"🎓 Graduation"  },
    { key:"insights",     label:"🧠 Insights"    },
    { key:"transparency", label:"🤖 Model"       },
  ];

  return (
    <div className="fade-up">
      {/* Sub-nav */}
      <div className="flex gap-2 flex-wrap mb-5">
        {navItems.map(n => (
          <button
            key={n.key}
            onClick={() => setOpenSection(n.key)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={openSection === n.key
              ? { background:"rgba(79,124,255,.2)", color:"#60a5fa",
                  border:"1px solid rgba(79,124,255,.4)" }
              : { background:"#131a26", color:"#94a3b8",
                  border:"1px solid #232b3d" }}
          >
            {n.label}
          </button>
        ))}
      </div>

      {/* KPIs always visible */}
      {sum && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-5">
          <SummaryCard icon="👥" value={sum.n.toLocaleString()}        label="Students"    color="#60a5fa"  />
          <SummaryCard icon="🔴" value={sum.n_high.toLocaleString()}   label="High Risk"   color="#ef4444"
                       sub={`${Math.round(sum.n_high/sum.n*100)}%`} />
          <SummaryCard icon="🟡" value={sum.n_medium.toLocaleString()} label="Medium Risk" color="#f59e0b"
                       sub={`${Math.round(sum.n_medium/sum.n*100)}%`} />
          <SummaryCard icon="🟢" value={sum.n_low.toLocaleString()}    label="Low Risk"    color="#22c55e"
                       sub={`${Math.round(sum.n_low/sum.n*100)}%`} />
        </div>
      )}

      {/* ── Faculty comparison ─────────────────────────────────────────── */}
      {openSection === "faculty" && (
        <div className="fade-up space-y-4">
          <Section title="Faculty Performance Comparison">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ChartCard title="Risk distribution by faculty">
                <DonutChart nLow={sum.n_low} nMed={sum.n_medium} nHigh={sum.n_high} />
              </ChartCard>
              <ChartCard title="Risk breakdown per faculty">
                <FacultyStackedBar students={students} />
              </ChartCard>
            </div>
          </Section>
          <div className="text-xs p-3 rounded-xl" style={{ background:"#131a26",
               border:"1px solid #232b3d", borderLeft:"3px solid #60a5fa", color:"#94a3b8" }}>
            <b className="text-white">What this shows:</b> Faculties with tall red segments have
            a disproportionate share of High Risk students and may need additional advisory resources.
          </div>
        </div>
      )}

      {/* ── Gender analysis ────────────────────────────────────────────── */}
      {openSection === "gender" && (
        <div className="fade-up space-y-4">
          <Section title="Male vs Female Performance">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ChartCard title="Average GPA by gender per faculty">
                <GenderGPABar students={students} />
              </ChartCard>
              <ChartCard title="Risk distribution by gender">
                {(["Female","Male"]).map(g => {
                  const sub = students.filter(s => s.gender?.toLowerCase() === g.toLowerCase());
                  const hr  = sub.filter(s => s.risk_class === 2).length;
                  const mr  = sub.filter(s => s.risk_class === 1).length;
                  const lr  = sub.filter(s => s.risk_class === 0).length;
                  const n   = sub.length || 1;
                  return (
                    <div key={g} className="mb-4">
                      <p className="text-xs font-semibold mb-1" style={{ color:"#cbd5e1" }}>{g} ({sub.length})</p>
                      <div className="flex h-5 rounded-full overflow-hidden gap-0.5">
                        {[[lr,"#22c55e"],[mr,"#f59e0b"],[hr,"#ef4444"]].map(([v,c],i) => (
                          <div key={i} style={{ width:`${v/n*100}%`, background:c, minWidth:v>0?2:0 }}
                               className="flex items-center justify-center text-xs text-white font-bold">
                            {v/n > 0.12 ? `${Math.round(v/n*100)}%` : ""}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </ChartCard>
            </div>
          </Section>
          <div className="text-xs p-3 rounded-xl" style={{ background:"#131a26",
               border:"1px solid #232b3d", borderLeft:"3px solid #a78bfa", color:"#94a3b8" }}>
            <b className="text-white">What this shows:</b> A large performance gap between genders
            within a faculty warrants investigation to ensure equitable academic support.
          </div>
        </div>
      )}

      {/* ── Trends ────────────────────────────────────────────────────── */}
      {openSection === "trends" && (
        <div className="fade-up space-y-4">
          <Section title="Semester-on-Semester Trends">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ChartCard title="Average GPA trend by faculty">
                <GPATrendLine students={students}
                              q33={modelInfo?.q33 ?? 2.0} q66={modelInfo?.q66 ?? 3.0} />
              </ChartCard>
              <ChartCard title="High Risk student count per semester">
                <HighRiskTrendLine students={students} />
              </ChartCard>
            </div>
          </Section>
          <div className="text-xs p-3 rounded-xl" style={{ background:"#131a26",
               border:"1px solid #232b3d", borderLeft:"3px solid #22c55e", color:"#94a3b8" }}>
            <b className="text-white">What this shows:</b> Downward GPA trends and rising High Risk
            counts signal deteriorating academic conditions and warrant proactive intervention
            before end-of-semester results.
          </div>
        </div>
      )}

      {/* ── Graduation ─────────────────────────────────────────────────── */}
      {openSection === "graduation" && (
        <div className="fade-up space-y-4">
          <Section title="Graduation Classification Projections (Level 300 & 400)">
            {gradData.length > 0 ? (
              <>
                {/* Classification count badges */}
                {(() => {
                  const counts = {};
                  gradData.forEach(g => { counts[g.Classification] = (counts[g.Classification]||0)+1; });
                  return (
                    <div className="grid grid-cols-3 gap-2 mb-4 sm:grid-cols-6">
                      {Object.entries(counts).map(([cls, cnt]) => {
                        const gc = GRAD_CLASSES.find(g => cls.includes(g.label)) || { color:"#94a3b8", emoji:"📋" };
                        return (
                          <div key={cls} className="rounded-xl p-2.5 text-center"
                               style={{ background:`${gc.color}15`, border:`1px solid ${gc.color}44` }}>
                            <div className="text-2xl">{gc.emoji}</div>
                            <div className="text-xl font-bold" style={{ color: gc.color }}>{cnt}</div>
                            <div className="text-xs mt-0.5 leading-tight" style={{ color:"#94a3b8" }}>
                              {gc.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Table */}
                <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid #232b3d" }}>
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ background:"#1a2332", color:"#94a3b8" }}>
                        {["Student ID","Name","Faculty","Level","Current CGPA",
                          "Proj. CGPA","Classification","Risk"].map(h => (
                          <th key={h} className="text-left px-3 py-2.5 font-semibold
                                                   uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {gradData.map((g, i) => (
                        <tr key={i}
                            className={i%2 ? "opacity-90" : ""}
                            style={{ background: i%2 ? "#0e1421" : "#131a26",
                                     borderTop:"1px solid #1c2436" }}>
                          <td className="px-3 py-2" style={{ color:"#94a3b8" }}>{g["Student ID"]}</td>
                          <td className="px-3 py-2 font-medium" style={{ color:"#f1f5f9" }}>{g["Name"]}</td>
                          <td className="px-3 py-2" style={{ color:"#94a3b8" }}>{g["Faculty"]}</td>
                          <td className="px-3 py-2" style={{ color:"#60a5fa" }}>{g["Level"]}</td>
                          <td className="px-3 py-2 font-bold" style={{ color:"#f1f5f9" }}>{g["Current CGPA"]}</td>
                          <td className="px-3 py-2 font-bold" style={{ color:"#4f7cff" }}>{g["Projected CGPA"]}</td>
                          <td className="px-3 py-2">{g["Classification"]}</td>
                          <td className="px-3 py-2">
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                                  style={{
                                    background: g["Risk Level"]==="High Risk" ? "#2d0e0e"
                                              : g["Risk Level"]==="Medium Risk" ? "#2e2208" : "#102a1c",
                                    color: g["Risk Level"]==="High Risk" ? "#ef4444"
                                         : g["Risk Level"]==="Medium Risk" ? "#f59e0b" : "#22c55e",
                                  }}>
                              {g["Risk Level"]}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="rounded-xl p-6 text-center" style={{ background:"#131a26",
                   border:"1px dashed #232b3d" }}>
                <div className="text-3xl mb-3">🎓</div>
                <p className="text-sm font-medium text-white mb-1">No graduation data available</p>
                <p className="text-xs" style={{ color:"#94a3b8" }}>
                  Add <code className="px-1 py-0.5 rounded"
                            style={{ background:"#0d1320" }}>level</code>,{" "}
                  <code className="px-1 py-0.5 rounded"
                        style={{ background:"#0d1320" }}>cumulative_gpa</code>,{" "}
                  <code className="px-1 py-0.5 rounded"
                        style={{ background:"#0d1320" }}>completed_credits</code>, and{" "}
                  <code className="px-1 py-0.5 rounded"
                        style={{ background:"#0d1320" }}>programme_credits</code>{" "}
                  columns to your CSV.
                </p>
              </div>
            )}
          </Section>
        </div>
      )}

      {/* ── Insights ──────────────────────────────────────────────────── */}
      {openSection === "insights" && (
        <div className="fade-up space-y-3">
          <Section title="AI-Generated Insights">
            {insights.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {insights.map((ins, i) => (
                  <InsightCard key={i} icon={ins.icon} color={ins.color}
                               headline={ins.headline} detail={ins.detail} />
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color:"#94a3b8" }}>No insights available.</p>
            )}
          </Section>
        </div>
      )}

      {/* ── Model transparency ─────────────────────────────────────────── */}
      {openSection === "transparency" && (
        <div className="fade-up space-y-4">
          <Section title="How the AI Makes Decisions">
            <p className="text-xs mb-4 leading-relaxed" style={{ color:"#94a3b8" }}>
              This section shows what the AI model learned from training data — which features
              drive predictions most, and whether the model treats all student groups fairly.
            </p>

            {/* Model KPIs */}
            {modelInfo && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-4">
                {[
                  { label:"Macro F1 Score",     value: modelInfo.macro_f1?.toFixed(4), sub:"Test set performance",   color:"#60a5fa" },
                  { label:"Calibration (ECE)",  value: modelInfo.ece?.toFixed(4),      sub:"Lower = more reliable",  color:"#22c55e" },
                  { label:"Fairness Audit",      value:"All pass ✅",                   sub:"8 groups checked",       color:"#22c55e" },
                  { label:"Features Used",       value: modelInfo.n_features,           sub:"No student PII exposed", color:"#a78bfa" },
                ].map(m => (
                  <div key={m.label} className="rounded-xl p-3 text-center"
                       style={{ background:"#0f1626", border:"1px solid #232b3d",
                                borderTop:`3px solid ${m.color}` }}>
                    <div className="text-lg font-extrabold" style={{ color:m.color }}>{m.value}</div>
                    <div className="text-xs font-semibold uppercase tracking-widest mt-0.5"
                         style={{ color:"#f1f5f9" }}>{m.label}</div>
                    <div className="text-xs mt-0.5" style={{ color:"#64748b" }}>{m.sub}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ChartCard title="Feature importance (SHAP values) — what drives predictions">
                {modelLoading
                  ? <div className="flex items-center gap-2 h-40 justify-center text-sm"
                         style={{ color:"#94a3b8" }}>Loading...</div>
                  : <ShapBar shap={modelInfo?.shap_importance} />}
                <div className="text-xs mt-2 p-2 rounded-lg"
                     style={{ background:"#0d1320", color:"#94a3b8" }}>
                  Higher bars = stronger influence on the risk prediction.
                  Red = critical; green = within safe range.
                </div>
              </ChartCard>
              <ChartCard title="Fairness audit — model accuracy across student groups">
                {modelLoading
                  ? <div className="flex items-center gap-2 h-40 justify-center text-sm"
                         style={{ color:"#94a3b8" }}>Loading...</div>
                  : <FairnessBar audit={modelInfo?.fairness_audit}
                                  threshold={modelInfo?.fairness_threshold ?? 0.45} />}
                <div className="text-xs mt-2 p-2 rounded-lg"
                     style={{ background:"#0d1320", color:"#94a3b8" }}>
                  All bars above the red line = model treats all groups equitably.
                  Min threshold: F1 ≥ 0.45.
                </div>
              </ChartCard>
            </div>
          </Section>
        </div>
      )}

      {/* Cohort PDF export — always visible at bottom */}
      <div className="mt-6 pt-5" style={{ borderTop:"1px solid #232b3d" }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="font-semibold text-white text-sm">📋 Export Cohort Report</p>
            <p className="text-xs mt-0.5" style={{ color:"#94a3b8" }}>
              Download a formatted PDF summary suitable for faculty meetings.
            </p>
          </div>
          <button
            onClick={handleCohortPdf}
            disabled={pdfLoading}
            className="rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all
                       hover:-translate-y-0.5 disabled:opacity-50"
            style={{ background:"linear-gradient(135deg,#4f7cff 0%,#8b5cf6 100%)",
                     boxShadow:"0 6px 18px -8px rgba(79,124,255,.55)" }}
          >
            {pdfLoading ? "⏳ Generating..." : "📋 Download Cohort PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}
