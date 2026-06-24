"use client";
import { create } from "zustand";

const useAppStore = create((set, get) => ({
  // ── Auth ─────────────────────────────────────────────────────────────────
  user: null,          // { role, faculty, icon, tabs }
  token: null,

  initAuth: () => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("pu_user");
    const token  = localStorage.getItem("pu_token");
    if (stored && token) {
      try {
        set({ user: JSON.parse(stored), token });
      } catch (_) { /* invalid stored state */ }
    }
  },

  setAuth: (user, token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pu_user", JSON.stringify(user));
      localStorage.setItem("pu_token", token);
    }
    set({ user, token });
  },

  clearAuth: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("pu_user");
      localStorage.removeItem("pu_token");
    }
    set({ user: null, token: null, batchResult: null, lastPrediction: null });
  },

  // ── Predictions ───────────────────────────────────────────────────────────
  lastPrediction: null,   // { request, response } from /predict/individual
  setLastPrediction: (req, res) => set({ lastPrediction: { request: req, response: res } }),

  // ── Batch results ─────────────────────────────────────────────────────────
  batchResult: null,      // full BatchResponse from /predict/batch
  setBatchResult: (result) => set({ batchResult: result }),
  clearBatchResult: () => set({ batchResult: null }),

  // ── Model info (SHAP, fairness, metrics) ──────────────────────────────────
  modelInfo: null,
  setModelInfo: (info) => set({ modelInfo: info }),

  // ── UI state ──────────────────────────────────────────────────────────────
  activeTab: "predict",   // "predict" | "analytics" | "batch"
  setActiveTab: (tab) => set({ activeTab: tab }),

  searchQuery: "",
  setSearchQuery: (q) => set({ searchQuery: q }),

  riskFilter: "all",      // "all" | "Low Risk" | "Medium Risk" | "High Risk"
  setRiskFilter: (f) => set({ riskFilter: f }),

  analyticsOpen: false,
  setAnalyticsOpen: (v) => set({ analyticsOpen: v }),
}));

export default useAppStore;
