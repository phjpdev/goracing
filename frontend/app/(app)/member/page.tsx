"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { useLanguage } from "@/lib/context/LanguageContext";
import { ROUTES } from "@/lib/constants";

export default function MemberPage() {
  const { auth, refreshAuth } = useAuth();
  const { t, locale } = useLanguage();
  const router = useRouter();

  const isAdmin = auth?.role === "admin";
  const isSubadmin = auth?.role === "subadmin";
  const isManager = isAdmin || isSubadmin;

  const roleLabels: Record<string, string> = {
    member: t.header.roleMember,
    admin: t.header.roleAdmin,
    subadmin: t.header.roleSubadmin,
  };

  const vipDays = auth?.vip_expiry_date
    ? Math.ceil((new Date(auth.vip_expiry_date).getTime() - Date.now()) / 86400000)
    : 0;

  const manageHref = isAdmin ? "/admin/members" : ROUTES.SUBADMIN_DASHBOARD;

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    await refreshAuth();
    router.push(ROUTES.MATCHES);
  };

  return (
    <main className="mx-auto w-full max-w-lg px-5 py-8">
      <h1 className="text-2xl font-semibold text-white">{t.nav.member}</h1>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-amber-200/90 to-amber-700/80 text-neutral-800">
            <svg className="h-9 w-9" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </span>
          <div>
            <p className="text-lg font-medium text-white">
              {roleLabels[auth?.role ?? "member"] ?? auth?.role}
            </p>
            {vipDays > 0 && (
              <span className="mt-1 inline-block rounded bg-[#28E88E] px-2 py-0.5 text-xs font-bold text-[#020308]">
                VIP {vipDays}
                {locale === "zh-TW" ? "天" : "d"}
              </span>
            )}
          </div>
        </div>

        {isManager && (
          <Link
            href={manageHref}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-4 py-3 text-sm font-medium text-[#fbbf24] no-underline transition hover:bg-[#f59e0b]/20"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {t.nav.manageMembers}
          </Link>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-white/5"
        >
          {t.header.logout}
        </button>
      </div>
    </main>
  );
}
