"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/lib/context/LanguageContext";

type RecordDetail = {
  id: string;
  date: string;
  description: string;
  media_urls: string[];
  created_at: string;
};

function isVideo(url: string) {
  return /\.(mp4|webm|mov|avi)$/i.test(url);
}

function formatDate(iso: string, locale: string) {
  const d = new Date(iso);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekdays =
    locale === "zh-TW"
      ? ["日", "一", "二", "三", "四", "五", "六"]
      : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const wd = weekdays[d.getDay()];

  if (locale === "zh-TW") {
    return `${year}年${month}月${day}日 (週${wd})`;
  }
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${day}, ${year} (${wd})`;
}

export default function RecordDetailPage() {
  const { t, locale } = useLanguage();
  const params = useParams();
  const id = params?.id as string;
  const [record, setRecord] = useState<RecordDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch("/api/records")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: RecordDetail[]) => {
        const found = data.find((r) => r.id === id);
        setRecord(found ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#28E88E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <p className="text-white/60 text-lg">Record not found</p>
        <Link href="/" className="text-[#28E88E] text-sm hover:underline">
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Lightbox */}
      {selectedMedia && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <button
            className="absolute top-6 right-6 text-white/60 hover:text-white text-3xl"
            onClick={() => setSelectedMedia(null)}
          >
            ×
          </button>
          {isVideo(selectedMedia) ? (
            <video
              src={`http://localhost:8000${selectedMedia}`}
              className="max-w-full max-h-[90vh] rounded-lg"
              controls
              autoPlay
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img
              src={`http://localhost:8000${selectedMedia}`}
              alt=""
              className="max-w-full max-h-[90vh] rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}

      <main className="mx-auto w-full max-w-[900px] px-5 sm:px-6 py-8 sm:py-12">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition mb-8 no-underline"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {locale === "zh-TW" ? "返回" : "Back"}
        </Link>

        {/* Date */}
        <p className="text-[#28E88E] text-sm font-medium mb-3">
          {formatDate(record.date, locale)}
        </p>

        {/* Description */}
        <div className="text-[16px] leading-[1.8] text-white/80 whitespace-pre-wrap mb-10">
          {record.description}
        </div>

        {/* Media gallery */}
        {record.media_urls.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {record.media_urls.map((url, i) => (
              <div
                key={i}
                className="relative rounded-xl overflow-hidden bg-[#111] cursor-pointer group"
                onClick={() => setSelectedMedia(url)}
              >
                {isVideo(url) ? (
                  <video
                    src={`http://localhost:8000${url}`}
                    className="w-full h-[260px] sm:h-[300px] object-cover"
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={`http://localhost:8000${url}`}
                    alt=""
                    className="w-full h-[260px] sm:h-[300px] object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white opacity-0 group-hover:opacity-80 transition-opacity"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
