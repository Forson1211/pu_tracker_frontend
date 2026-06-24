"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAppStore from "@/store/useAppStore";
import Sidebar from "@/components/layout/Sidebar";
import TopBanner from "@/components/layout/TopBanner";
import PredictTab from "@/components/dashboard/PredictTab";
import BatchTab from "@/components/dashboard/BatchTab";
import AnalyticsTab from "@/components/analytics/AnalyticsTab";

export default function DashboardPage() {
  const router = useRouter();
  const { user, initAuth, activeTab } = useAppStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("pu_token");
      if (!token) { router.replace("/login"); }
    }
  }, [router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-4xl animate-pulse">🎓</div>
      </div>
    );
  }

  const tabs = user.tabs || [];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        <TopBanner />

        {/* Tab content */}
        <div>
          {activeTab === "predict"   && tabs.includes("predict")   && <PredictTab />}
          {activeTab === "analytics" && tabs.includes("analytics") && <AnalyticsTab />}
          {activeTab === "batch"     && tabs.includes("batch")     && <BatchTab />}
        </div>
      </main>
    </div>
  );
}
