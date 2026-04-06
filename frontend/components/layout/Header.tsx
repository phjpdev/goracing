"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/ui";
import { useAuth } from "@/lib/context/AuthContext";
import { useLanguage } from "@/lib/context/LanguageContext";
import { ROUTES } from "@/lib/constants";

export type HeaderVariant = "default" | "transparent";

export function Header({ variant = "default" }: { variant?: HeaderVariant }) {
  const isTransparent = variant === "transparent";
  const { auth, refreshAuth } = useAuth();
  const { locale, t, toggleLocale } = useLanguage();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const manageHref =
    auth?.role === "admin" ? ROUTES.ADMIN_DASHBOARD : ROUTES.SUBADMIN_DASHBOARD;
  const isManager = auth?.role === "admin" || auth?.role === "subadmin";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setDropdownOpen(false);
    await refreshAuth();
    router.push(ROUTES.HOME);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-white/10 backdrop-blur-sm ${
        isTransparent
          ? "bg-transparent lg:bg-black/95 lg:border-white/10"
          : "bg-black/95"
      }`}
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Logo />

        <div className="flex items-center gap-3 sm:gap-5">
          {/* Language toggle */}
          <button
            type="button"
            onClick={toggleLocale}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/5 hover:text-white transition"
          >
            {locale === "zh-TW" ? "EN" : "繁中"}
          </button>

          {auth?.authenticated && (
            <>
              {/* Profile avatar with dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-1.5 rounded-full transition hover:opacity-90"
                  aria-label="Account menu"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-b from-amber-200/90 to-amber-700/80 text-neutral-800">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </span>
                  <svg className="h-4 w-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 rounded-xl border border-white/10 bg-[#0D1117] py-1 shadow-xl">
                    {auth.role && (() => {
                      const roleLabels: Record<string, string> = {
                        member: t.header.roleMember,
                        admin: t.header.roleAdmin,
                        subadmin: t.header.roleSubadmin,
                      };
                      const vipDays = auth.vip_expiry_date
                        ? Math.ceil((new Date(auth.vip_expiry_date).getTime() - Date.now()) / 86400000)
                        : 0;
                      return (
                        <div className="px-4 py-2 flex items-center gap-2 border-b border-white/10">
                          <span className="text-xs text-[#B3B3B3]">{roleLabels[auth.role] ?? auth.role}</span>
                          {vipDays > 0 && (
                            <span className="bg-[#28E88E] text-[#020308] text-[10px] font-bold px-1.5 py-0.5 rounded">
                              VIP {vipDays}{locale === "zh-TW" ? "天" : "d"}
                            </span>
                          )}
                        </div>
                      );
                    })()}
                    {isManager && (
                      <>
                        <Link
                          href="/admin/analytics"
                          onClick={() => setDropdownOpen(false)}
                          className="flex w-full px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 transition no-underline"
                        >
                          {t.admin.analytics}
                        </Link>
                        {auth?.role === "admin" && (
                          <Link
                            href={ROUTES.ADMIN_RECORDS}
                            onClick={() => setDropdownOpen(false)}
                            className="flex w-full px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 transition no-underline"
                          >
                            {t.header.records}
                          </Link>
                        )}
                        <Link
                          href={manageHref}
                          onClick={() => setDropdownOpen(false)}
                          className="flex w-full px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 transition no-underline"
                        >
                          {t.header.manage}
                        </Link>
                        <div className="my-1 border-t border-white/10" />
                      </>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-white/5 transition"
                    >
                      {t.header.logout}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
