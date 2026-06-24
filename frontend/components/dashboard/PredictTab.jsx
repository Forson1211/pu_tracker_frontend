"use client";
import { useState, useMemo } from "react";
import useAppStore from "@/store/useAppStore";
import StudentCard from "./StudentCard";
import { RISK_LABEL } from "@/lib/constants";

export default function PredictTab() {
  const { batchResult, user } = useAppStore();
  const [search, setSearch]       = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const students = batchResult?.students ?? [];

  const filtered = useMemo(() => {
    let list = [...students];
    if (riskFilter !== "all") {
      const cls = Object.entries(RISK_LABEL).find(([,v]) => v === riskFilter)?.[0];
      if (cls != null) list = list.filter(s => s.risk_class === Number(cls));
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(s =>
        String(s.student_id ?? "").toLowerCase().includes(q) ||
        String(s.name ?? "").toLowerCase().includes(q)
      );
    }
    // High Risk first
    list.sort((a, b) => (b.risk_class ?? 0) - (a.risk_class ?? 0));
    return list;
  }, [students, search, riskFilter]);

  if (!batchResult) {
    return (
      <div className="space-y-6 fade-up">
        <div>
          <h2 className="text-lg font-bold text-white mb-1">Student Risk Predictions</h2>
          <p className="text-sm" style={{ color: "#94a3b8" }}>
            Upload a CSV in the Batch Inference tab to view individual student predictions here.
          </p>
        </div>
        <div className="rounded-2xl p-8 text-center"
             style={{ background: "#131a26", border: "1px dashed #232b3d" }}>
          <div className="text-5xl mb-4">🎓</div>
          <p className="font-semibold text-white mb-2">No predictions loaded</p>
          <p className="text-sm" style={{ color: "#94a3b8" }}>
            Go to <b>Batch Inference</b> and upload your student records CSV.
            All predictions will appear here automatically.
          </p>
        </div>
      </div>
    );
  }

  const n    = students.length;
  const n_hr = students.filter(s => s.risk_class === 2).length;

  return (
    <div className="fade-up">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white mb-1">Student Risk Predictions</h2>
        <p className="text-sm" style={{ color: "#94a3b8" }}>
          {n.toLocaleString()} students analysed &nbsp;·&nbsp;
          <span style={{ color: "#ef4444" }}>
            {n_hr} need immediate attention
          </span>
        </p>
      </div>

      {/* Search + filter */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or student ID..."
          className="flex-1 min-w-48 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
          style={{ background: "#131a26", border: "1px solid #232b3d", color: "#f1f5f9" }}
          onFocus={e => e.target.style.borderColor = "#4f7cff"}
          onBlur={e  => e.target.style.borderColor = "#232b3d"}
        />
        <select
          value={riskFilter}
          onChange={e => setRiskFilter(e.target.value)}
          className="rounded-xl px-4 py-2.5 text-sm outline-none"
          style={{ background: "#131a26", border: "1px solid #232b3d", color: "#f1f5f9" }}
        >
          <option value="all">All Students</option>
          <option value="High Risk">🔴 High Risk</option>
          <option value="Medium Risk">🟡 Medium Risk</option>
          <option value="Low Risk">🟢 Low Risk</option>
        </select>
      </div>

      {/* Count */}
      <p className="text-xs mb-3" style={{ color: "#64748b" }}>
        Showing {filtered.length.toLocaleString()} student{filtered.length !== 1 ? "s" : ""}
        {riskFilter !== "all" ? ` — ${riskFilter}` : ""}
        {search ? ` matching "${search}"` : ""}
      </p>

      {filtered.length === 0 && (
        <div className="rounded-2xl p-6 text-center"
             style={{ background: "#131a26", border: "1px solid #232b3d" }}>
          <p className="text-sm" style={{ color: "#94a3b8" }}>
            No students match your search. Try a different name or ID.
          </p>
        </div>
      )}

      {/* Student cards — High Risk auto-expanded */}
      {filtered.map((student, i) => (
        <StudentCard
          key={`${student.student_id}_${student.semester}_${i}`}
          student={student}
          defaultOpen={student.risk_class === 2 && i < 5}
        />
      ))}
    </div>
  );
}
