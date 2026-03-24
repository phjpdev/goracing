"use client";

import { useCallback, useEffect, useState } from "react";
import { useLanguage } from "@/lib/context/LanguageContext";

type SourceStat = { total: number; vip: number };
type AnalyticsData = {
  sources: Record<string, SourceStat>;
  date: string;
  daily_income: number;
};

const PLATFORM_META: Record<string, { color: string; icon: JSX.Element }> = {
  FACEBOOK: {
    color: "#1877F2",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  INSTAGRAM: {
    color: "#E4405F",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  THREADS: {
    color: "#FFFFFF",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.432 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.282-1.592-1.632a8.625 8.625 0 01-.169 2.09c-.333 1.593-1.066 2.756-2.18 3.452-1.041.652-2.349.963-3.882.924-1.793-.046-3.2-.62-4.064-1.66-.77-.924-1.163-2.135-1.14-3.504.044-2.588 1.86-4.488 4.612-4.82.946-.113 1.874-.1 2.779.038-.113-.583-.334-1.03-.672-1.337-.482-.44-1.24-.669-2.252-.683l-.008-.002c-.789 0-1.924.193-2.748 1.086l-1.5-1.378C7.309 4.428 9.027 3.8 10.818 3.8h.013c1.535.02 2.757.455 3.63 1.293.808.775 1.27 1.85 1.405 3.228.552.12 1.073.285 1.558.497 1.203.525 2.162 1.39 2.77 2.5.834 1.52.925 4.156-1.128 6.17-1.769 1.736-4.003 2.493-7.025 2.512zm-1.478-7.317c-.267 0-.537.012-.807.042-1.618.193-2.524 1.1-2.548 2.555-.014.818.218 1.46.69 1.905.555.523 1.396.793 2.5.82 1.066.027 1.944-.183 2.611-.626.67-.445 1.108-1.168 1.336-2.15.18-.776.21-1.546.088-2.29a8.124 8.124 0 00-3.87-.256z" />
      </svg>
    ),
  },
};

function todayLocal() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Hong_Kong" });
}

export default function AnalyticsPage() {
  const { t, locale } = useLanguage();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [date, setDate] = useState(todayLocal());
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async (d: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/analytics?date=${d}`);
      if (res.ok) setData(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAnalytics(date); }, [date, fetchAnalytics]);

  const sources = data?.sources ?? {};
  const totalAll = Object.values(sources).reduce((s, v) => s + v.total, 0);
  const vipAll = Object.values(sources).reduce((s, v) => s + v.vip, 0);

  return (
    <div>
      <h2 className="text-lg font-semibold text-[#28E88E] mb-8">{t.admin.analytics}</h2>

      {loading && !data ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#28E88E]/30 border-t-[#28E88E]" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* ═══ Overview Cards ═══ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total users */}
            <div className="bg-[#0D1117] border border-white/10 rounded-xl p-5">
              <p className="text-xs text-[#B3B3B3] mb-1">{t.admin.totalUsers}</p>
              <p className="text-3xl font-bold text-white">{totalAll}</p>
            </div>
            {/* VIP users */}
            <div className="bg-[#0D1117] border border-[#28E88E]/20 rounded-xl p-5">
              <p className="text-xs text-[#28E88E] mb-1">{t.admin.vipUsers}</p>
              <p className="text-3xl font-bold text-[#28E88E]">{vipAll}</p>
            </div>
            {/* Daily income */}
            <div className="bg-[#0D1117] border border-amber-500/20 rounded-xl p-5 col-span-2 lg:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-amber-400">{t.admin.dailyIncome}</p>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-transparent border border-white/10 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-amber-400/50 [color-scheme:dark]"
                />
              </div>
              <p className="text-3xl font-bold text-amber-400">
                ${data?.daily_income?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) ?? "0"}
              </p>
              <p className="text-xs text-[#B3B3B3] mt-1">{data?.date ?? date}</p>
            </div>
          </div>

          {/* ═══ Platform Breakdown ═══ */}
          <div>
            <h3 className="text-sm font-medium text-[#B3B3B3] mb-4">
              {locale === "zh-TW" ? "平台數據" : "Platform Breakdown"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(["FACEBOOK", "INSTAGRAM", "THREADS"] as const).map((platform) => {
                const stat = sources[platform] ?? { total: 0, vip: 0 };
                const meta = PLATFORM_META[platform];
                const pct = totalAll > 0 ? Math.round((stat.total / totalAll) * 100) : 0;

                return (
                  <div
                    key={platform}
                    className="bg-[#0D1117] border border-white/10 rounded-xl p-5 hover:border-white/20 transition"
                  >
                    {/* Platform header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
                      >
                        {meta.icon}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{platform}</p>
                        <p className="text-xs text-[#B3B3B3]">{pct}% {locale === "zh-TW" ? "佔比" : "of total"}</p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1.5 bg-white/5 rounded-full mb-4 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: meta.color }}
                      />
                    </div>

                    {/* Stats row */}
                    <div className="flex gap-4">
                      <div className="flex-1 bg-white/5 rounded-lg p-3 text-center">
                        <p className="text-xl font-bold text-white">{stat.total}</p>
                        <p className="text-[10px] text-[#B3B3B3] mt-0.5">{t.admin.totalUsers}</p>
                      </div>
                      <div className="flex-1 bg-[#28E88E]/5 rounded-lg p-3 text-center">
                        <p className="text-xl font-bold text-[#28E88E]">{stat.vip}</p>
                        <p className="text-[10px] text-[#28E88E]/70 mt-0.5">{t.admin.vipUsers}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
