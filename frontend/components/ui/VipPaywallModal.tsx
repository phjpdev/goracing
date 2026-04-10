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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-[460px] rounded-[10px] p-[1px] shadow-[0_40px_140px_rgba(0,0,0,0.82)]"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.08) 42%, rgba(255,255,255,0.05) 100%)",
        }}
      >
        <div className="relative overflow-hidden rounded-[10px] bg-[#0b0d0c] px-6 py-6 sm:px-8 sm:py-8 ring-1 ring-white/10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full blur-3xl"
            style={{
              background: "radial-gradient(circle, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 70%)",
            }}
          />

          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0d0c]"
            aria-label="Close"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          <div className="flex items-center justify-center">
            <h2
              id={titleId}
              className="text-center font-inter text-[20px] sm:text-[22px] font-semibold tracking-[-0.02em] text-white"
            >
              分析
            </h2>
          </div>

          <div className="mt-6 flex items-center justify-center">
            <Image
              src="/assets/lock.jpg"
              alt="Locked"
              width={120}
              height={120}
              className="object-contain"
              priority
            />
          </div>

          <p className="mt-6 text-center font-inter text-[15px] sm:text-[16px] leading-[1.5] text-white/85">
            付费後可查看分析
          </p>
        </div>
      </div>
    </div>
  );
}

