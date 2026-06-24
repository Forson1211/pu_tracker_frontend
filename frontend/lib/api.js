import { API_BASE } from "./constants";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("pu_token");
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    // Expired or invalid token — clear and reload to show login
    localStorage.removeItem("pu_token");
    localStorage.removeItem("pu_user");
    window.location.href = "/login";
    throw new Error("Session expired.");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

// ── Auth ─────────────────────────────────────────────────────────────────
export async function fetchRoles() {
  return request("/api/auth/roles");
}

export async function login(role, password) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ role, password }),
  });
}

// ── Meta ──────────────────────────────────────────────────────────────────
export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/api/meta/health`);
  return res.json();
}

export async function fetchModelInfo() {
  return request("/api/meta/model-info");
}

// ── Predictions ───────────────────────────────────────────────────────────
export async function predictIndividual(payload) {
  return request("/api/predict/individual", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function predictSimulate(payload) {
  return request("/api/predict/simulate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function predictBatch(csvFile) {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", csvFile);
  const res = await fetch(`${API_BASE}/api/predict/batch`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Reports ───────────────────────────────────────────────────────────────
export async function downloadStudentPdf(student) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/reports/student-pdf`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ student }),
  });
  if (!res.ok) throw new Error("PDF generation failed.");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `report_${student.student_id || "student"}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadCohortPdf(students) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/reports/cohort-pdf`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ students }),
  });
  if (!res.ok) throw new Error("Cohort PDF generation failed.");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `cohort_report.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
