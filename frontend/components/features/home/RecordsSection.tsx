"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/context/LanguageContext";

type RecordItem = {
  id: string;
  date: string;
  description: string;
  media_urls: string[];
};

function isVideo(url: string) {
  return /\.(mp4|webm|mov|avi)$/i.test(url);
}

function formatDate(iso: string, locale: string) {
  const d = new Date(iso);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();

  if (locale === "zh-TW") {
    return `${year}年${month}月${day}日`;
  }
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${day}, ${year}`;
}

export function RecordsSection() {
  const { t, locale } = useLanguage();
  const [records, setRecords] = useState<RecordItem[]>([]);

  useEffect(() => {
    fetch("/api/records")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setRecords(data);
      })
      .catch(() => {});
  }, []);

  if (records.length === 0) return null;

  return (
    <section className="mx-auto mt-16 sm:mt-24 lg:mt-32 w-full max-w-[1360px] px-5 sm:px-6 lg:px-10">
      <div className="text-center">
        <h2 className="text-[28px] sm:text-[34px] lg:text-[40px] font-semibold leading-[1.2] tracking-[-0.01em] text-white">
          {t.records.title}
        </h2>
      </div>

      {/* Horizontal scrollable cards */}
      <div className="mt-10 sm:mt-14 flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {records.map((record) => {
          const firstMedia = record.media_urls?.[0];
          return (
            <article
              key={record.id}
              className="snap-start shrink-0 w-[300px] sm:w-[340px] overflow-hidden rounded-[16px] border border-white/[0.08] bg-white/[0.03] transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.06]"
            >
              {/* Thumbnail */}
              <div className="relative h-[200px] sm:h-[220px] w-full bg-[#0D1117] flex items-center justify-center">
                {firstMedia ? (
                  isVideo(firstMedia) ? (
                    <video
                      src={`http://localhost:8000${firstMedia}`}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={`http://localhost:8000${firstMedia}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <svg className="w-12 h-12 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>

              {/* Content */}
              <div className="p-5 lg:p-6">
                <p className="text-xs text-[#28E88E] font-medium mb-2">{formatDate(record.date, locale)}</p>
                <p className="text-[14px] leading-[1.6] text-white/50 line-clamp-3">{record.description}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
