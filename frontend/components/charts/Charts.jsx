"use client";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, ReferenceLine, ReferenceArea,
} from "recharts";
import { FACULTIES, FAC_COLOR, RISK_COLOR, RISK_LABEL } from "@/lib/constants";

const CHART_BG    = "#161b22";
const AXIS_COLOR  = "#94a3b8";
const GRID_COLOR  = "#232b3d";

// ── Donut — risk distribution ─────────────────────────────────────────────
export function DonutChart({ nLow, nMed, nHigh }) {
  const total = nLow + nMed + nHigh || 1;
  const data = [
    { name: "Low Risk",    value: nLow,  color: RISK_COLOR[0] },
    { name: "Medium Risk", value: nMed,  color: RISK_COLOR[1] },
    { name: "High Risk",   value: nHigh, color: RISK_COLOR[2] },
  ];
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data} cx="50%" cy="50%"
          innerRadius={72} outerRadius={105}
          paddingAngle={3} dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map(d => <Cell key={d.name} fill={d.color} stroke="#0a0e17" strokeWidth={3} />)}
        </Pie>
        <Tooltip
          contentStyle={{ background: CHART_BG, border: "1px solid #2a3344", borderRadius: 10 }}
          formatter={(v) => [v.toLocaleString(), "Students"]}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, color: AXIS_COLOR }}
          formatter={v => <span style={{ color: "#cbd5e1" }}>{v}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── Stacked bar — risk per faculty ────────────────────────────────────────
export function FacultyStackedBar({ students }) {
  const data = FACULTIES.map(fac => {
    const sub = students.filter(s => s.faculty === fac);
    return {
      faculty: fac,
      "Low Risk":    sub.filter(s => s.risk_class === 0).length,
      "Medium Risk": sub.filter(s => s.risk_class === 1).length,
      "High Risk":   sub.filter(s => s.risk_class === 2).length,
    };
  });
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
        <XAxis dataKey="faculty" tick={{ fill: AXIS_COLOR, fontSize: 12 }} axisLine={false} />
        <YAxis tick={{ fill: AXIS_COLOR, fontSize: 11 }} axisLine={false} />
        <Tooltip
          contentStyle={{ background: CHART_BG, border: "1px solid #2a3344", borderRadius: 10 }}
        />
        <Legend
          wrapperStyle={{ fontSize: 11 }}
          formatter={v => <span style={{ color: "#cbd5e1" }}>{v}</span>}
        />
        {[["Low Risk",RISK_COLOR[0]],["Medium Risk",RISK_COLOR[1]],["High Risk",RISK_COLOR[2]]].map(([k,c]) => (
          <Bar key={k} dataKey={k} stackId="a" fill={c} radius={k==="High Risk"?[4,4,0,0]:undefined} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Line chart — GPA trend per faculty over semesters ────────────────────
export function GPATrendLine({ students, q33 = 2.0, q66 = 3.0 }) {
  // Build semester × faculty avg GPA
  const semSet = [...new Set(students.map(s => s.semester))].sort();
  if (semSet.length < 2) return (
    <div className="flex items-center justify-center h-48 text-sm" style={{ color: "#5b6b8c" }}>
      Need at least 2 semesters for trend data
    </div>
  );

  const data = semSet.map(sem => {
    const row = { semester: sem };
    FACULTIES.forEach(fac => {
      const sub = students.filter(s => s.semester === sem && s.faculty === fac);
      row[fac] = sub.length ? +(sub.reduce((a, s) => a + s.semester_gpa, 0) / sub.length).toFixed(2) : null;
    });
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
        <XAxis dataKey="semester" tick={{ fill: AXIS_COLOR, fontSize: 11 }} angle={-25} textAnchor="end" />
        <YAxis domain={[0, 4.2]} tick={{ fill: AXIS_COLOR, fontSize: 11 }} axisLine={false} />
        <Tooltip
          contentStyle={{ background: CHART_BG, border: "1px solid #2a3344", borderRadius: 10 }}
          formatter={(v) => [v?.toFixed(2), "Avg GPA"]}
        />
        <Legend wrapperStyle={{ fontSize: 11 }}
                formatter={v => <span style={{ color: "#cbd5e1" }}>{v}</span>} />
        <ReferenceArea y1={0} y2={q33} fill="#ef444408" />
        <ReferenceArea y1={q33} y2={q66} fill="#f59e0b06" />
        <ReferenceLine y={q33} stroke="#ef4444" strokeDasharray="4 4" strokeOpacity={0.7}
                       label={{ value: `High Risk (${q33})`, fill: "#ef4444", fontSize: 10 }} />
        <ReferenceLine y={q66} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.7}
                       label={{ value: `Med Risk (${q66})`, fill: "#f59e0b", fontSize: 10, position: "insideBottomRight" }} />
        {FACULTIES.map(fac => (
          <Line key={fac} type="monotone" dataKey={fac} stroke={FAC_COLOR[fac]}
                strokeWidth={2.5} dot={{ r: 5, fill: FAC_COLOR[fac], stroke: "#0a0e17", strokeWidth: 2 }}
                connectNulls />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── High Risk trend per faculty ───────────────────────────────────────────
export function HighRiskTrendLine({ students }) {
  const semSet = [...new Set(students.map(s => s.semester))].sort();
  if (semSet.length < 2) return (
    <div className="flex items-center justify-center h-48 text-sm" style={{ color: "#5b6b8c" }}>
      Need at least 2 semesters for trend data
    </div>
  );
  const data = semSet.map(sem => {
    const row = { semester: sem };
    FACULTIES.forEach(fac => {
      row[fac] = students.filter(s => s.semester === sem && s.faculty === fac && s.risk_class === 2).length;
    });
    return row;
  });
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
        <XAxis dataKey="semester" tick={{ fill: AXIS_COLOR, fontSize: 11 }} angle={-25} textAnchor="end" />
        <YAxis tick={{ fill: AXIS_COLOR, fontSize: 11 }} axisLine={false} allowDecimals={false} />
        <Tooltip contentStyle={{ background: CHART_BG, border: "1px solid #2a3344", borderRadius: 10 }} />
        <Legend wrapperStyle={{ fontSize: 11 }}
                formatter={v => <span style={{ color: "#cbd5e1" }}>{v}</span>} />
        {FACULTIES.map(fac => (
          <Line key={fac} type="monotone" dataKey={fac} stroke={FAC_COLOR[fac]}
                strokeWidth={2.5} dot={{ r: 5, fill: FAC_COLOR[fac], stroke: "#0a0e17", strokeWidth: 2 }}
                connectNulls />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── Gender GPA grouped bar ────────────────────────────────────────────────
export function GenderGPABar({ students }) {
  const data = FACULTIES.map(fac => {
    const sub = students.filter(s => s.faculty === fac);
    const female = sub.filter(s => s.gender?.trim().toLowerCase() === "female");
    const male   = sub.filter(s => s.gender?.trim().toLowerCase() === "male");
    return {
      faculty: fac,
      Female: female.length ? +(female.reduce((a,s) => a+s.semester_gpa,0)/female.length).toFixed(2) : 0,
      Male:   male.length   ? +(male.reduce((a,s) => a+s.semester_gpa,0)/male.length).toFixed(2) : 0,
    };
  });
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
        <XAxis dataKey="faculty" tick={{ fill: AXIS_COLOR, fontSize: 12 }} axisLine={false} />
        <YAxis domain={[0, 4.2]} tick={{ fill: AXIS_COLOR, fontSize: 11 }} axisLine={false} />
        <Tooltip contentStyle={{ background: CHART_BG, border: "1px solid #2a3344", borderRadius: 10 }}
                 formatter={(v) => [v?.toFixed(2), "Avg GPA"]} />
        <Legend wrapperStyle={{ fontSize: 11 }}
                formatter={v => <span style={{ color: "#cbd5e1" }}>{v}</span>} />
        <ReferenceLine y={2.0} stroke="#ef4444" strokeDasharray="4 4" strokeOpacity={0.6}
                       label={{ value:"High Risk (2.0)", fill:"#ef4444", fontSize:9 }} />
        <Bar dataKey="Female" fill="#a78bfa" radius={[4,4,0,0]} />
        <Bar dataKey="Male"   fill="#60a5fa" radius={[4,4,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── SHAP importance bar ───────────────────────────────────────────────────
export function ShapBar({ shap }) {
  if (!shap?.length) return null;
  const labels = {
    avg_total_mark:"Avg Total Mark", avg_exam_score:"Exam Score",
    gpa_trend:"GPA Trend", avg_ca_score:"CA Score",
    consec_fails:"Consecutive Fails", trend_x_fail:"Trend × Fail",
    fac_FEHAS:"Faculty FEHAS", prev_gpa:"Previous GPA",
    fac_FESAC:"Faculty FESAC", gender_enc:"Gender",
  };
  const data = [...shap]
    .sort((a,b) => b.importance - a.importance)
    .map(d => ({ ...d, label: labels[d.feature] || d.feature }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} horizontal={false} />
        <XAxis type="number" tick={{ fill: AXIS_COLOR, fontSize: 10 }} axisLine={false} />
        <YAxis type="category" dataKey="label" width={110}
               tick={{ fill: "#cbd5e1", fontSize: 10 }} axisLine={false} />
        <Tooltip contentStyle={{ background: CHART_BG, border: "1px solid #2a3344", borderRadius: 10 }}
                 formatter={(v) => [v.toFixed(3), "SHAP"]} />
        <Bar dataKey="importance" radius={[0,4,4,0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={
              d.importance > 0.25 ? "#ef4444"
              : d.importance > 0.13 ? "#f59e0b"
              : "#22c55e"
            } />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Fairness audit bar ────────────────────────────────────────────────────
export function FairnessBar({ audit, threshold = 0.45 }) {
  if (!audit?.length) return null;
  const data = audit.map(d => ({ ...d, threshold }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 50, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} horizontal={false} />
        <XAxis type="number" domain={[0, 1]} tick={{ fill: AXIS_COLOR, fontSize: 10 }} axisLine={false}
               tickFormatter={v => v.toFixed(1)} />
        <YAxis type="category" dataKey="group" width={70}
               tick={{ fill: "#cbd5e1", fontSize: 11 }} axisLine={false} />
        <Tooltip contentStyle={{ background: CHART_BG, border: "1px solid #2a3344", borderRadius: 10 }}
                 formatter={(v,n) => [v.toFixed(3), n === "macro_f1" ? "Macro F1" : "Threshold"]} />
        <ReferenceLine x={threshold} stroke="#ef4444" strokeDasharray="4 4" strokeOpacity={0.7}
                       label={{ value:`Min (${threshold})`, fill:"#ef4444", fontSize:10, position:"top" }} />
        <Bar dataKey="macro_f1" radius={[0,4,4,0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.macro_f1 >= threshold ? "#22c55e" : "#ef4444"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Gauge-style probability display ──────────────────────────────────────
export function ProbBar({ probLow, probMed, probHigh }) {
  const segs = [
    { label:"Low",  pct: probLow*100,  color: RISK_COLOR[0] },
    { label:"Med",  pct: probMed*100,  color: RISK_COLOR[1] },
    { label:"High", pct: probHigh*100, color: RISK_COLOR[2] },
  ];
  return (
    <div>
      <div className="flex h-6 rounded-full overflow-hidden gap-0.5">
        {segs.map(s => (
          <div key={s.label}
               className="flex items-center justify-center text-xs font-bold text-white transition-all prog-bar"
               style={{ width:`${s.pct}%`, background: s.color, minWidth: s.pct > 8 ? "auto" : 0 }}>
            {s.pct > 12 ? `${s.pct.toFixed(0)}%` : ""}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs mt-1" style={{ color: "#94a3b8" }}>
        {segs.map(s => (
          <span key={s.label} style={{ color: s.color, fontWeight: 600 }}>
            {s.label} {s.pct.toFixed(0)}%
          </span>
        ))}
      </div>
    </div>
  );
}
