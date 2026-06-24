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
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-[#070a13]">
      {/* Background ambient glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md z-10 fade-up">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-3xl mb-4 shadow-inner">
            🎓
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1 bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            Pentecost University
          </h1>
          <p className="text-xs font-bold tracking-widest uppercase bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Academic Performance Tracker
          </p>
          <p className="text-sm mt-3 text-slate-400">
            Sign in to view and manage student risk predictions
          </p>
        </div>

        {/* Model status warning */}
        {modelReady === false && (
          <div className="mb-5 rounded-2xl p-4 text-xs border flex items-start gap-3 bg-amber-950/40 border-amber-500/30 text-amber-200 shadow-lg backdrop-blur-md">
            <span className="text-lg mt-0.5">⚠️</span>
            <div>
              <strong className="font-semibold block mb-1">Prediction Model Setup Required</strong>
              <span>Please upload <code>best_model.pkl</code>, <code>scaler.pkl</code>, <code>feature_cols.json</code>, and <code>thresholds.json</code> to the backend.</span>
            </div>
          </div>
        )}

        {/* Glassmorphic Login Card */}
        <div className="rounded-2xl p-8 bg-slate-900/60 border border-slate-800/80 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Who are you?
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <select
                  value={role}
                  onChange={e => { setRole(e.target.value); setError(""); }}
                  className="w-full rounded-xl pl-11 pr-10 py-3.5 text-sm bg-slate-950/60 border border-slate-800 text-slate-200 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
                >
                  <option value="">Select your role...</option>
                  {roles.map(r => (
                    <option key={r.role} value={r.role} className="bg-slate-900">{r.icon} {r.role}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  placeholder="Enter your password"
                  className="w-full rounded-xl pl-11 pr-4 py-3.5 text-sm bg-slate-950/60 border border-slate-800 text-slate-200 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm rounded-xl px-4 py-3 bg-red-950/40 border border-red-500/30 text-red-200 flex items-start gap-2.5 shadow-md">
                <span className="text-red-400 mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3.5 font-bold text-white text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_8px_24px_-8px_rgba(79,124,255,0.4)] disabled:shadow-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 rounded-full border-2 border-white border-t-transparent spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  Sign In 
                  <svg className="w-4 h-4 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-8 text-slate-500 tracking-wide">
          © 2025 Pentecost University &nbsp;·&nbsp; Ghana DPA 2012 (Act 843) Compliant
        </p>
      </div>
    </div>
  );
}
