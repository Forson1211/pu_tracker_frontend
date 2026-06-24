"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchRoles, login, fetchHealth } from "@/lib/api";
import useAppStore from "@/store/useAppStore";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAppStore();
  const [roles, setRoles]         = useState([]);
  const [role, setRole]           = useState("");
  const [password, setPassword]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [modelReady, setModelReady] = useState(null);

  useEffect(() => {
    // If already logged in, go straight to dashboard
    if (localStorage.getItem("pu_token")) { router.replace("/dashboard"); return; }
    fetchRoles().then(setRoles).catch(() => {});
    fetchHealth().then(h => setModelReady(h.model_ready)).catch(() => {});
  }, [router]);

  async function handleLogin(e) {
    e.preventDefault();
    if (!role) { setError("Please select your role."); return; }
    if (!password) { setError("Please enter your password."); return; }
    setLoading(true); setError("");
    try {
      const res = await login(role, password);
      setAuth({ role: res.role, faculty: res.faculty, icon: res.icon, tabs: res.tabs }, res.token);
      router.replace("/dashboard");
    } catch (err) {
      setError(err.message || "Incorrect role or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
         style={{ background: "radial-gradient(ellipse 900px 500px at 50% -5%, rgba(79,124,255,.12), transparent 60%), #0a0e17" }}>
      <div className="w-full max-w-md fade-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🎓</div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">
            Pentecost University
          </h1>
          <p className="text-sm font-semibold tracking-widest uppercase"
             style={{ color: "#60a5fa" }}>
            Academic Performance Tracker
          </p>
          <p className="text-sm mt-2" style={{ color: "#94a3b8" }}>
            Sign in to view and manage student risk predictions
          </p>
          <div className="h-px mt-5 mx-auto w-48"
               style={{ background: "linear-gradient(90deg, transparent, #4f7cff, transparent)" }} />
        </div>

        {/* Model status */}
        {modelReady === false && (
          <div className="mb-4 rounded-xl p-3 text-sm border flex items-start gap-2"
               style={{ background: "#2e2208", borderColor: "#f59e0b", color: "#fde68a" }}>
            <span className="mt-0.5">⚠️</span>
            <span><b>Setup required:</b> The prediction model files are not found on the server.
              Upload <code>best_model.pkl</code>, <code>scaler.pkl</code>,{" "}
              <code>feature_cols.json</code>, and <code>thresholds.json</code> to the backend.</span>
          </div>
        )}

        {/* Card */}
        <div className="rounded-2xl p-8"
             style={{ background: "#131a26", border: "1px solid #232b3d",
                      boxShadow: "0 24px 64px -20px rgba(0,0,0,.6)" }}>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
                     style={{ color: "#94a3b8" }}>
                Who are you?
              </label>
              <select
                value={role}
                onChange={e => { setRole(e.target.value); setError(""); }}
                className="w-full rounded-xl px-4 py-3 text-sm transition-all outline-none"
                style={{ background: "#1a2332", border: "1px solid #232b3d", color: "#f1f5f9" }}
              >
                <option value="">Select your role...</option>
                {roles.map(r => (
                  <option key={r.role} value={r.role}>{r.icon} {r.role}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
                     style={{ color: "#94a3b8" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                placeholder="Enter your password"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={{ background: "#1a2332", border: "1px solid #232b3d", color: "#f1f5f9" }}
                onFocus={e => e.target.style.borderColor = "#4f7cff"}
                onBlur={e => e.target.style.borderColor = "#232b3d"}
              />
            </div>

            {error && (
              <p className="text-sm rounded-xl px-4 py-2"
                 style={{ background: "#2d0e0e", color: "#fca5a5",
                          border: "1px solid #ef444466" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3 font-bold text-white text-sm
                         transition-all hover:-translate-y-0.5 active:translate-y-0
                         disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #4f7cff 0%, #8b5cf6 100%)",
                       boxShadow: loading ? "none" : "0 8px 24px -8px rgba(79,124,255,.6)" }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 rounded-full border-2 border-white
                                   border-t-transparent spin" />
                  Signing in...
                </span>
              ) : "Sign In →"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "#64748b" }}>
          2025 Pentecost University &nbsp;·&nbsp; Ghana DPA 2012 (Act 843) Compliant
        </p>
      </div>
    </div>
  );
}
