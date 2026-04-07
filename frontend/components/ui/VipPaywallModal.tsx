"use client";

import Image from "next/image";
import { useEffect, useId, useRef } from "react";

type VipPaywallModalProps = {
  open: boolean;
  onClose: () => void;
};

export function VipPaywallModal({ open, onClose }: VipPaywallModalProps) {
  const titleId = useId();
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-[420px] rounded-[28px] p-[1px] shadow-[0_30px_120px_rgba(0,0,0,0.75)]"
        style={{
          background:
            "linear-gradient(180deg, rgba(40,232,142,0.34) 0%, rgba(255,255,255,0.10) 45%, rgba(255,255,255,0.06) 100%)",
        }}
      >
        <div className="relative rounded-[27px] bg-[#0d0d0d] px-6 py-6 sm:px-7 sm:py-7">
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#28E88E]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0d0d]"
            aria-label="Close"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          <h2 id={titleId} className="text-center font-inter text-[20px] font-semibold tracking-[-0.02em] text-white">
            分析
          </h2>

          <div className="mt-5 flex items-center justify-center">
            <div className="relative h-[112px] w-[112px] overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_18px_50px_rgba(0,0,0,0.55)]">
              <Image src="/assets/lock.jpg" alt="Locked" fill className="object-contain p-2" priority />
            </div>
          </div>

          <p className="mt-5 text-center font-inter text-[16px] leading-[1.4] text-white/85">
            付费後可查看分析
          </p>
        </div>
      </div>
    </div>
  );
}

