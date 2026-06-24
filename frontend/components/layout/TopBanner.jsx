"use client";
import useAppStore from "@/store/useAppStore";
import { FACULTY_FULL } from "@/lib/constants";

export default function TopBanner() {
  const { user } = useAppStore();
  if (!user) return null;

  const facDisplay = user.faculty
    ? `${user.faculty} — ${FACULTY_FULL[user.faculty]}`
    : "All Faculties";

  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div
      className="rounded-2xl p-5 flex items-center gap-4 mb-5 relative overflow-hidden"
      style={{
        background: "linear-gradient(120deg,#1b2a52 0%,#3349a8 55%,#5b3fae 100%)",
        boxShadow: "0 12px 32px -12px rgba(79,124,255,.45)",
      }}
    >
      {/* subtle radial highlight */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 85% 20%, rgba(255,255,255,.14), transparent 45%)",
        }}
      />
      {/* icon badge */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl
                   flex-shrink-0 relative z-10"
        style={{ background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.2)" }}
      >
        🎓
      </div>
      <div className="relative z-10 flex-1">
        <h1 className="text-xl font-extrabold text-white tracking-tight">
          Academic Performance Tracker
        </h1>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {[
            `${user.icon} ${user.role}`,
            `🏛️ ${facDisplay}`,
            `📅 ${today}`,
          ].map((pill) => (
            <span
              key={pill}
              className="text-xs font-medium px-3 py-0.5 rounded-full"
              style={{ background: "rgba(255,255,255,.14)", color: "#cdd9ff",
                       border: "1px solid rgba(255,255,255,.18)" }}
            >
              {pill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
