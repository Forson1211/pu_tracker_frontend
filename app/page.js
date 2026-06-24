"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("pu_token");
    router.replace(token ? "/dashboard" : "/login");
  }, [router]);
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-4xl animate-pulse">🎓</div>
    </div>
  );
}
