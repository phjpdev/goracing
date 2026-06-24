"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { useLanguage } from "@/lib/context/LanguageContext";
import { ROUTES } from "@/lib/constants";

const LOGO_IMAGE = "/assets/logo.png";
const TELEGRAM_URL = "https://t.me";

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
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
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
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
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
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
    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 448 512" aria-hidden>
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
  isCenter?: boolean;
};

function NavTab({
  item,
  active,
}: {
  item: TabItem;
  active: boolean;
}) {
  const colorClass = active ? "text-[#f59e0b]" : "text-white/70";

  if (item.isCenter) {
    return (
      <Link
        href={item.href}
        className="flex flex-1 flex-col items-center justify-end pb-1 min-w-0 no-underline"
        aria-label={item.label}
        aria-current={active ? "page" : undefined}
      >
        <span className="flex h-[82px] w-[82px] items-center justify-center rounded-t-full rounded-bl-none rounded-br-none bg-black shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
          <Image
            src={LOGO_IMAGE}
            alt=""
            width={72}
            height={72}
            className="h-[52px] w-[52px] object-contain"
            style={{ width: '68px', height: '80px', marginBottom: '-20px'}}
          />
        </span>
      </Link>
    );
  }

  const content = (
    <>
      <span className={colorClass}>{item.icon}</span>
      <span className={`mt-1 text-[10px] font-medium leading-none ${colorClass}`}>
        {item.label}
      </span>
    </>
  );

  const className = "flex flex-1 flex-col items-center justify-end pb-1 pt-2 no-underline min-w-0";

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

export function MobileBottomNav() {
  const pathname = usePathname();
  const { auth } = useAuth();
  const { t } = useLanguage();

  const recordsHref =
    auth?.role === "admin" ? ROUTES.ADMIN_RECORDS : ROUTES.RECORDS;
  const memberHref = auth?.authenticated ? ROUTES.MEMBER : ROUTES.LOGIN;

  const isHome = pathname === ROUTES.HOME;
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
      href: ROUTES.HOME,
      label: t.nav.home,
      icon: <HomeIcon active={isHome} />,
    },
    {
      key: "matches",
      href: ROUTES.MATCHES,
      label: t.nav.matches,
      isCenter: true,
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
      href: TELEGRAM_URL,
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
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-black md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Mobile navigation"
    >
      <div className="mx-auto flex h-[62px] max-w-lg items-end justify-between px-2">
        {tabs.map((tab) => (
          <NavTab key={tab.key} item={tab} active={activeByKey[tab.key]} />
        ))}
      </div>
    </nav>
  );
}
