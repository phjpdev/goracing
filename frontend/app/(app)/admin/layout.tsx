"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/context/LanguageContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const tabs = [
    { href: "/admin/members", label: t.admin.members },
    { href: "/admin/admins", label: t.admin.admins },
    { href: "/admin/analytics", label: t.admin.analytics },
  ];

  return (
    <div className="min-h-screen bg-[#020308] text-white">
      <div className="mx-auto w-full max-w-[1600px] px-3 sm:px-6 lg:px-8">
        {/* Sub-nav */}
        <nav className="border-b border-white/10">
          <div className="flex gap-6">
            {tabs.map((tab) => {
              const active = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                    active
                      ? "border-[#28E88E] text-[#28E88E]"
                      : "border-transparent text-[#B3B3B3] hover:text-white"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="py-6">
          {children}
        </div>
      </div>
    </div>
  );
}
