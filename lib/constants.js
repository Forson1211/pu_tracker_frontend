// Mirrors backend/app/config.py exactly.
// Any change to the backend config must be reflected here.

export const FACULTIES = ["FESAC", "FBA", "FEHAS", "PSTM"];

export const SEMESTERS = [
  "2019_S1","2019_S2","2020_S1","2020_S2",
  "2021_S1","2021_S2","2022_S1","2022_S2",
];

export const RISK_LABEL  = { 0:"Low Risk",  1:"Medium Risk", 2:"High Risk" };
export const RISK_ICON   = { 0:"🟢",         1:"🟡",           2:"🔴" };
export const RISK_COLOR  = { 0:"#22c55e",   1:"#f59e0b",     2:"#ef4444" };
export const RISK_BG     = { 0:"#102a1c",   1:"#2e2208",     2:"#2d0e0e" };
export const RISK_BORDER = { 0:"#22c55e",   1:"#f59e0b",     2:"#ef4444" };

export const RISK_MEANING = {
  0: "This student is performing well and is not currently at risk of academic difficulty.",
  1: "This student shows some signs of academic difficulty. A check-in is recommended.",
  2: "This student is at significant risk of failing next semester. Immediate action is needed.",
};

export const FACULTY_FULL = {
  FESAC: "Faculty of Engineering & Applied Sciences",
  FBA:   "Faculty of Business Administration",
  FEHAS: "Faculty of Education, Humanities & Applied Sciences",
  PSTM:  "Pentecost School of Theology & Ministry",
};

export const FAC_COLOR = {
  FESAC: "#60a5fa", FBA: "#f59e0b", FEHAS: "#22c55e", PSTM: "#a78bfa",
};

export const GRAD_CLASSES = [
  { min:3.60, max:4.00, label:"First Class",        color:"#FFD700", emoji:"🥇" },
  { min:3.00, max:3.59, label:"Second Class Upper",  color:"#C0C0C0", emoji:"🥈" },
  { min:2.00, max:2.99, label:"Second Class Lower",  color:"#CD7F32", emoji:"🥉" },
  { min:1.50, max:1.99, label:"Third Class",         color:"#f59e0b", emoji:"📜" },
  { min:1.00, max:1.49, label:"Pass",                color:"#94a3b8", emoji:"📋" },
  { min:0.00, max:0.99, label:"Fail",                color:"#ef4444", emoji:"❌" },
];

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://pu-tracker-api-3.onrender.com";
