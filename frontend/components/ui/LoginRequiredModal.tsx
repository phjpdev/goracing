"use client";

import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import { ROUTES } from "@/lib/constants";
import { useLanguage } from "@/lib/context/LanguageContext";

type LoginRequiredModalProps = {
  open: boolean;
  onClose: () => void;
};

export function LoginRequiredModal({ open, onClose }: LoginRequiredModalProps) {
  const { t } = useLanguage();
  const titleId = useId();
  const loginBtnRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    loginBtnRef.current?.focus();

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
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.08) 42%, rgba(255,255,255,0.05) 100%)",
        }}
      >
        <div className="relative overflow-hidden rounded-[10px] bg-[#0b0d0c] px-6 py-6 sm:px-8 sm:py-8 ring-1 ring-white/10">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          <h2
            id={titleId}
            className="text-center font-inter text-[20px] sm:text-[22px] font-semibold tracking-[-0.02em] text-white"
          >
            {t.auth.loginRequiredTitle}
          </h2>

          <p className="mt-5 text-center font-inter text-[15px] sm:text-[16px] leading-[1.5] text-white/85">
            {t.auth.loginRequiredMessage}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              ref={loginBtnRef}
              href={ROUTES.LOGIN}
              className="inline-flex items-center justify-center rounded-lg bg-[#28E88E] px-6 py-3 text-sm font-semibold text-[#020308] no-underline transition hover:bg-[#22d17f]"
            >
              {t.auth.loginRequiredCta}
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-lg border border-white/15 px-6 py-3 text-sm font-medium text-white/80 transition hover:bg-white/5"
            >
              {t.auth.loginRequiredCancel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
