"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ROUTES } from "@/lib/constants";
import { useLanguage } from "@/lib/context/LanguageContext";
import type { HKJCMeeting, HKJCRace } from "@/types/race-meeting";

type AnalysisPick = {
  no: string;
  name?: string;
  winPct?: string;
};

type AnalysisPayload = {
  topPicks?: AnalysisPick[];
  manualTop4?: string[];
};

function uniq(arr: string[]) {
  return Array.from(new Set(arr));
}

export default function AdminEditRaceTop4Page() {
  const { t, locale } = useLanguage();
  const isZh = locale === "zh-TW";
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const raceId = (params?.id as string) ?? "";
  const date = searchParams.get("date") ?? "";
  const venue = searchParams.get("venue") ?? "";

  const [race, setRace] = useState<HKJCRace | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [p3, setP3] = useState("");
  const [p4, setP4] = useState("");

  const backHref = `${ROUTES.RACE(raceId)}?date=${date}&venue=${venue}`;

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!raceId || !date || !venue) {
        setError("missing");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      setTouched(false);

      let foundRace: HKJCRace | null = null;
      try {
        const meetingsRes = await fetch(`/api/races/meetings?date=${date}&venue=${venue}`);
        const meetings: HKJCMeeting[] = await meetingsRes.json();
        foundRace = meetings?.[0]?.races?.find((r) => r.id === raceId) ?? null;
        if (!foundRace) {
          if (!cancelled) {
            setError("notfound");
            setLoading(false);
          }
          return;
        }
        if (!cancelled) setRace(foundRace);
      } catch {
        if (!cancelled) {
          setError("failed");
          setLoading(false);
        }
        return;
      }

      // Fetch cached analysis (no Gemini call)
      try {
        const res = await fetch(`/api/analyses/${raceId}`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setAnalysis(data?.analysis_json ?? null);
        } else {
          // If not cached, generate via /api/races/analyze (admin page only)
          const analyzeRes = await fetch("/api/races/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ race: foundRace, date, venue }),
          });
          const analyzeData = await analyzeRes.json();
          if (analyzeRes.ok && !cancelled) setAnalysis(analyzeData);
        }
      } catch {
        // Ignore analysis errors; we can still allow manual selection from runners
      }

      if (!cancelled) setLoading(false);
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [raceId, date, venue]);

  const horseOptions = useMemo(() => {
    const runners = race?.runners ?? [];
    const byNo = new Map<string, { value: string; label: string }>();

    for (const r of runners) {
      const noStr = String((r as any).no ?? "").trim();
      if (!/^\d+$/.test(noStr)) continue;

      const name = (isZh ? r.name_ch || r.name_en : r.name_en || r.name_ch) || "";
      const label = `${noStr} ${name}`.trim();
      byNo.set(noStr, { value: noStr, label });
    }

    return Array.from(byNo.values()).sort((a, b) => Number(a.value) - Number(b.value));
  }, [race, isZh]);

  const titleText = isZh ? "編輯前四名" : "Edit Top 4";
  const selectText = isZh ? "選擇" : "Select";
  const cancelText = isZh ? "取消" : "Cancel";
  const saveText = isZh ? "儲存" : "Save";
  const savingText = isZh ? "儲存中…" : "Saving…";
  const loadingText = isZh ? "載入中…" : "Loading…";
  const label1 = isZh ? "第1名" : "1st";
  const label2 = isZh ? "第2名" : "2nd";
  const label3 = isZh ? "第3名" : "3rd";
  const label4 = isZh ? "第4名" : "4th";

  useEffect(() => {
    if (!race) return;
    if (touched) return;
    if (horseOptions.length === 0) return;

    const allowed = new Set(horseOptions.map((o) => o.value));
    const sanitize = (list: string[]) =>
      list.map(String).map((s) => s.trim()).filter((n) => allowed.has(n));

    const fromManual = sanitize(analysis?.manualTop4 ?? []);
    const fromPicks = sanitize((analysis?.topPicks ?? []).map((p) => String(p.no)));
    const fallback = horseOptions.map((o) => o.value);

    const candidate =
      fromManual.length >= 4
        ? fromManual
        : fromPicks.length >= 4
          ? fromPicks
          : fallback;

    const top4 = uniq(candidate).slice(0, 4);
    setP1(top4[0] ?? "");
    setP2(top4[1] ?? "");
    setP3(top4[2] ?? "");
    setP4(top4[3] ?? "");
  }, [race, analysis, horseOptions, touched]);

  async function onSave() {
    setError("");
    const top4 = [p1, p2, p3, p4].map(String).map((s) => s.trim()).filter(Boolean);
    if (top4.length !== 4) {
      setError("請選擇 4 匹馬");
      return;
    }
    if (uniq(top4).length !== 4) {
      setError("不能選擇重複馬匹");
      return;
    }
    const allowed = new Set(horseOptions.map((o) => o.value));
    const invalid = top4.filter((n) => !allowed.has(n));
    if (invalid.length > 0) {
      setError(`馬匹編號無效: ${invalid.join(", ")}`);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/analyses/${raceId}/top4`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ top4 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "保存失敗");
        setSaving(false);
        return;
      }
      router.push(backHref);
    } catch {
      setError("保存失敗");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-white/60">
        <div className="flex items-center gap-3">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-[#28E88E]" />
          {loadingText}
        </div>
      </div>
    );
  }

  if (error === "missing" || error === "notfound" || error === "failed") {
    const msg =
      error === "missing"
        ? t.races.missingContext
        : error === "notfound"
          ? t.races.raceNotFound
          : t.races.failedToLoad;
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 text-sm">{msg}</p>
        <Link href={ROUTES.ADMIN_DASHBOARD} className="text-[#28E88E] hover:underline">
          Back
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-start gap-2">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10 transition"
        >
          ← {t.races.back}
        </Link>
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-semibold text-white truncate">
            {titleText}
          </h1>
          <p className="text-sm text-white/50 truncate">
            {isZh ? `第 ${race?.no} 場` : `Race ${race?.no}`} · {date} · {venue}
          </p>
        </div>
      </div>

      {error && !["missing", "notfound", "failed"].includes(error) && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-red-300 text-sm">
          {error}
        </div>
      )}

      <section className="rounded-xl border border-white/10 bg-[#0d0d0d] p-4 sm:p-5">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-white/60">{label1}</label>
              <select
                value={p1}
                onChange={(e) => {
                  setTouched(true);
                  setP1(e.target.value);
                }}
                className="h-10 rounded-lg bg-[#141414] border border-white/10 px-3 text-sm text-white min-w-[220px]"
              >
                <option value="">{selectText}</option>
                {horseOptions.map((o) => (
                  <option key={`p1-${o.value}`} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-white/60">{label2}</label>
              <select
                value={p2}
                onChange={(e) => {
                  setTouched(true);
                  setP2(e.target.value);
                }}
                className="h-10 rounded-lg bg-[#141414] border border-white/10 px-3 text-sm text-white min-w-[220px]"
              >
                <option value="">{selectText}</option>
                {horseOptions.map((o) => (
                  <option key={`p2-${o.value}`} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-white/60">{label3}</label>
              <select
                value={p3}
                onChange={(e) => {
                  setTouched(true);
                  setP3(e.target.value);
                }}
                className="h-10 rounded-lg bg-[#141414] border border-white/10 px-3 text-sm text-white min-w-[220px]"
              >
                <option value="">{selectText}</option>
                {horseOptions.map((o) => (
                  <option key={`p3-${o.value}`} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-white/60">{label4}</label>
              <select
                value={p4}
                onChange={(e) => {
                  setTouched(true);
                  setP4(e.target.value);
                }}
                className="h-10 rounded-lg bg-[#141414] border border-white/10 px-3 text-sm text-white min-w-[220px]"
              >
                <option value="">{selectText}</option>
                {horseOptions.map((o) => (
                  <option key={`p4-${o.value}`} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href={backHref}
              className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 transition"
            >
              {cancelText}
            </Link>
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="inline-flex items-center justify-center rounded-lg bg-[#28E88E] px-4 py-2 text-sm font-semibold text-[#020308] hover:bg-[#28E88E]/90 disabled:opacity-50 transition"
            >
              {saving ? savingText : saveText}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

