"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/lib/context/AuthContext";
import { useLanguage } from "@/lib/context/LanguageContext";
import { ROUTES, MOBILE_BOTTOM_NAV_HEIGHT, MOBILE_BOTTOM_NAV_LOGO } from "@/lib/constants";

const LOGO_IMAGE = "/assets/logo.png";

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={active ? 2.25 : 1.75}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  );
}

function RecordIcon({ active }: { active: boolean }) {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={active ? 2.25 : 1.75}
        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
      />
    </svg>
  );
}

function MemberIcon({ active }: { active: boolean }) {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={active ? 2.25 : 1.75}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 448 512" aria-hidden>
      <path d="M446.7 98.6l-67.6 318.8c-5.1 22.5-18.4 28.1-37.3 17.5l-103-75.9-49.7 47.8c-5.5 5.5-10.1 10.1-20.7 10.1l7.4-104.9 190.9-172.5c8.3-7.4-1.8-11.5-12.9-4.1L117.8 284 16.2 252.2c-22.1-6.9-22.5-22.1 4.6-32.7L418.2 66.4c18.4-6.9 34.5 4.1 28.5 32.2z" />
    </svg>
  );
}

type TabItem = {
  key: string;
  href: string;
  label: string;
  icon?: React.ReactNode;
  external?: boolean;
};

function NavTab({
  item,
  active,
}: {
  item: TabItem;
  active: boolean;
}) {
  const colorClass = active ? "text-[#f59e0b]" : "text-white/70";

  const content = (
    <>
      <span className={colorClass}>{item.icon}</span>
      <span className={`mt-0.5 text-[8px] font-medium leading-none ${colorClass}`}>
        {item.label}
      </span>
    </>
  );

  const className =
    "flex h-full flex-1 flex-col items-center justify-end pb-0 pt-1 no-underline min-w-0";

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={item.label}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={item.href}
      className={className}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
    >
      {content}
    </Link>
  );
}

function BottomNavContent() {
  const pathname = usePathname();
  const { auth } = useAuth();
  const { t } = useLanguage();

  const recordsHref =
    auth?.role === "admin" ? ROUTES.ADMIN_RECORDS : ROUTES.RECORDS;
  const memberHref = auth?.authenticated ? ROUTES.MEMBER : ROUTES.LOGIN;

  const isHome = pathname === ROUTES.WELCOME;
  const isMatches =
    pathname === ROUTES.MATCHES ||
    pathname.startsWith("/races/") ||
    pathname === ROUTES.LAST_MATCHES;
  const isRecords =
    pathname === ROUTES.RECORDS ||
    pathname.startsWith("/records/") ||
    pathname === ROUTES.ADMIN_RECORDS;
  const isMember =
    pathname === ROUTES.MEMBER ||
    pathname === ROUTES.LOGIN ||
    pathname === ROUTES.SIGNUP ||
    pathname === ROUTES.ADMIN_LOGIN ||
    pathname === ROUTES.SUBADMIN_LOGIN;

  const tabs: TabItem[] = [
    {
      key: "home",
      href: ROUTES.WELCOME,
      label: t.nav.home,
      icon: <HomeIcon active={isHome} />,
    },
    {
      key: "records",
      href: recordsHref,
      label: t.nav.records,
      icon: <RecordIcon active={isRecords} />,
    },
    {
      key: "member",
      href: memberHref,
      label: t.nav.member,
      icon: <MemberIcon active={isMember} />,
    },
    {
      key: "telegram",
      href: ROUTES.TELEGRAM,
      label: t.nav.contact,
      external: true,
      icon: <TelegramIcon />,
    },
  ];

  const activeByKey: Record<string, boolean> = {
    home: isHome,
    matches: isMatches,
    records: isRecords,
    member: isMember,
    telegram: false,
  };

  return (
    <nav
      className="mobile-bottom-nav border-t border-white/10 bg-black md:hidden"
      style={{
        height: `calc(${MOBILE_BOTTOM_NAV_HEIGHT}px + env(safe-area-inset-bottom, 0px))`,
      }}
      aria-label="Mobile navigation"
    >
      <div
        className="relative mx-auto grid h-full w-full max-w-lg grid-cols-5 items-stretch px-1"
        style={{ height: `${MOBILE_BOTTOM_NAV_HEIGHT}px` }}
      >
        <NavTab item={tabs[0]} active={activeByKey.home} />
        <span aria-hidden className="pointer-events-none" />
        <NavTab item={tabs[1]} active={activeByKey.records} />
        <NavTab item={tabs[2]} active={activeByKey.member} />
        <NavTab item={tabs[3]} active={activeByKey.telegram} />

        <Link
          href={ROUTES.MATCHES}
          className="absolute bottom-0 left-[30%] z-10 flex -translate-x-1/2 items-end justify-center no-underline"
          style={{ width: `${MOBILE_BOTTOM_NAV_LOGO}px`, height: `${MOBILE_BOTTOM_NAV_LOGO}px` }}
          aria-label={t.nav.matches}
          aria-current={isMatches ? "page" : undefined}
        >
          <span
            className="flex items-center justify-center rounded-full bg-black shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
            style={{ width: `${MOBILE_BOTTOM_NAV_LOGO}px`, height: `${MOBILE_BOTTOM_NAV_LOGO}px` }}
          >
            <Image
              src={LOGO_IMAGE}
              alt=""
              width={34}
              height={34}
              className="h-[34px] w-[34px] object-contain"
            />
          </span>
        </Link>
      </div>
    </nav>
  );
}

export function MobileBottomNav() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(<BottomNavContent />, document.body);
}
