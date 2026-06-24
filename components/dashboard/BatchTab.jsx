"use client";
import { useState, useRef } from "react";
import { predictBatch } from "@/lib/api";
import useAppStore from "@/store/useAppStore";
import { SummaryCard, Spinner, GradBtn } from "@/components/ui";
import { DonutChart, FacultyStackedBar } from "@/components/charts/Charts";

const TEMPLATE_CSV = `student_id,name,faculty,gender,semester,semester_gpa,avg_attendance,avg_total_mark,avg_ca_score,avg_exam_score,total_credits,num_courses
100001,Alice Mensah,FESAC,Female,2021_S2,2.8,4.0,65.0,28.0,37.0,18,6
100001,Alice Mensah,FESAC,Female,2022_S1,2.5,3.5,60.0,25.0,35.0,18,6
100002,Kofi Asante,FBA,Male,2021_S2,1.3,2.0,42.0,17.0,25.0,21,7
100002,Kofi Asante,FBA,Male,2022_S1,0.9,1.5,35.0,14.0,21.0,21,7
`;

function downloadTemplate() {
  const blob = new Blob([TEMPLATE_CSV], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = "pu_student_template.csv"; a.click();
  URL.revokeObjectURL(url);
}

function downloadResults(students) {
  if (!students?.length) return;
  const cols = ["student_id","name","faculty","gender","semester",
                 "semester_gpa","risk_label","prob_low","prob_med","prob_high"];
  const header = cols.join(",");
  const rows = students.map(s =>
    cols.map(c => (s[c] ?? "")).join(",")
  );
  const csv  = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url;
  a.download = `predictions_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function BatchTab() {
  const { setBatchResult, batchResult } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [fileName, setFileName] = useState("");
  const inputRef  = useRef(null);

  async function handleFile(file) {
    if (!file) return;
    setFileName(file.name);
    setError(""); setLoading(true);
    try {
      const result = await predictBatch(file);
      setBatchResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const sum = batchResult?.summary;
  const students = batchResult?.students ?? [];

  return (
    <div className="space-y-6 fade-up">
      <div>
        <h2 className="text-lg font-bold text-white mb-1">Batch Model Inference</h2>
        <p className="text-sm" style={{ color: "#94a3b8" }}>
          Upload a CSV of student records. The system applies the full 16-feature
          engineering pipeline from the training notebook and runs the LightGBM
          classifier across your entire cohort automatically.
        </p>
      </div>

      {/* Upload card */}
      {!batchResult && (
        <div className="rounded-2xl p-6" style={{ background:"#131a26", border:"1px solid #232b3d" }}>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { num:"1", icon:"📤", title:"Upload CSV",    desc:"Drop your student records file" },
              { num:"2", icon:"⚡", title:"Auto-predict",  desc:"Model runs on the entire cohort" },
              { num:"3", icon:"📊", title:"View results",  desc:"See who needs attention" },
            ].map(s => (
              <div key={s.num} className="rounded-xl p-4 text-center"
                   style={{ background:"#0f1626", border:"1px solid #232b3d" }}>
                <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center
                                text-lg font-bold text-white"
                     style={{ background:"linear-gradient(135deg,#4f7cff,#8b5cf6)" }}>
                  {s.icon}
                </div>
                <div className="font-semibold text-sm text-white mb-1">{s.title}</div>
                <div className="text-xs" style={{ color:"#94a3b8" }}>{s.desc}</div>
              </div>
            ))}
          </div>

          {/* Drop zone */}
          <div
            className="rounded-xl p-8 text-center cursor-pointer transition-all
                       hover:border-blue-500/60 hover:bg-blue-500/5"
            style={{ border:"2px dashed #2a3344" }}
            onClick={() => inputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
          >
            <div className="text-4xl mb-3">📂</div>
            {loading ? (
              <div className="flex items-center justify-center gap-2 text-sm" style={{ color:"#94a3b8" }}>
                <Spinner size={5}/> Analysing {fileName}...
              </div>
            ) : (
              <>
                <p className="font-semibold text-white mb-1">
                  {fileName ? `${fileName} — click to change` : "Drop CSV here or click to browse"}
                </p>
                <p className="text-xs" style={{ color:"#64748b" }}>
                  Each student needs at least 2 semester rows for trend detection
                </p>
              </>
            )}
            <input
              ref={inputRef} type="file" accept=".csv"
              className="hidden"
              onChange={e => handleFile(e.target.files[0])}
            />
          </div>

          {error && (
            <div className="mt-3 rounded-xl p-3 text-sm"
                 style={{ background:"#2d0e0e", color:"#fca5a5", border:"1px solid #ef444466" }}>
              ❌ {error}
            </div>
          )}

          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={downloadTemplate}
              className="text-xs font-semibold px-4 py-2 rounded-lg transition-all hover:-translate-y-0.5"
              style={{ background:"#1a2332", border:"1px solid #232b3d", color:"#94a3b8" }}
            >
              📥 Download CSV Template
            </button>
            <div>
              <details className="text-xs" style={{ color:"#64748b" }}>
                <summary className="cursor-pointer hover:text-white transition-colors">
                  Required columns ▸
                </summary>
                <div className="mt-2 p-3 rounded-xl leading-loose"
                     style={{ background:"#0d1320", border:"1px solid #232b3d" }}>
                  student_id, name, faculty, gender, semester, semester_gpa,
                  avg_attendance, avg_total_mark, avg_ca_score, avg_exam_score,
                  total_credits, num_courses
                  <br/><span style={{ color:"#4f7cff" }}>Optional:</span>{" "}
                  level (Level 300/400), cumulative_gpa, completed_credits, programme_credits
                </div>
              </details>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {batchResult && sum && (
        <div className="space-y-5 fade-up">
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SummaryCard icon="👥" value={sum.n.toLocaleString()}   label="Assessed"     color="#60a5fa"  />
            <SummaryCard icon="🔴" value={sum.n_high.toLocaleString()} label="High Risk"
                         sub={`${Math.round(sum.n_high/sum.n*100)}% of cohort`} color="#ef4444" />
            <SummaryCard icon="🟡" value={sum.n_medium.toLocaleString()} label="Medium Risk"
                         sub={`${Math.round(sum.n_medium/sum.n*100)}%`} color="#f59e0b" />
            <SummaryCard icon="🟢" value={sum.n_low.toLocaleString()} label="Low Risk"
                         sub={`${Math.round(sum.n_low/sum.n*100)}%`} color="#22c55e" />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl p-4" style={{ background:"#131a26", border:"1px solid #232b3d" }}>
              <p className="text-xs font-semibold mb-2" style={{ color:"#94a3b8" }}>Risk breakdown</p>
              <DonutChart nLow={sum.n_low} nMed={sum.n_medium} nHigh={sum.n_high} />
            </div>
            <div className="rounded-2xl p-4" style={{ background:"#131a26", border:"1px solid #232b3d" }}>
              <p className="text-xs font-semibold mb-2" style={{ color:"#94a3b8" }}>Risk by faculty</p>
              <FacultyStackedBar students={students} />
            </div>
          </div>

          {/* Insights */}
          {batchResult.insights?.length > 0 && (
            <div className="rounded-2xl p-4" style={{ background:"#131a26", border:"1px solid #232b3d" }}>
              <p className="text-sm font-bold mb-3 text-white">🧠 What the data tells us</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {batchResult.insights.map((ins, i) => (
                  <div key={i} className="rounded-xl p-3"
                       style={{ background:"#0f1626", border:`1px solid #232b3d`,
                                borderLeft:`4px solid ${ins.color}` }}>
                    <div className="font-semibold text-sm mb-1 text-white">
                      {ins.icon} {ins.headline}
                    </div>
                    <div className="text-xs leading-relaxed" style={{ color:"#94a3b8" }}>
                      {ins.detail}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            <GradBtn onClick={() => downloadResults(students)}>
              📥 Download Results CSV
            </GradBtn>
            <button
              onClick={() => { setBatchResult(null); setFileName(""); }}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5"
              style={{ background:"#1a2332", border:"1px solid #232b3d", color:"#94a3b8" }}
            >
              ↑ Upload New File
            </button>
          </div>

          <p className="text-xs" style={{ color:"#64748b" }}>
            ✅ Results are now available in the <b className="text-white">Faculty Analytics</b> tab.
            Go there to see trends, gender breakdown, and the cohort PDF export.
          </p>
        </div>
      )}
    </div>
  );
}
