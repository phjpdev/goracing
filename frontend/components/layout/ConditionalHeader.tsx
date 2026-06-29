"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { ROUTES } from "@/lib/constants";

const HIDDEN_HEADER_ROUTES: ReadonlySet<string> = new Set([ROUTES.WELCOME]);

export function ConditionalHeader() {
  const pathname = usePathname();

  if (HIDDEN_HEADER_ROUTES.has(pathname)) {
    return null;
  }

  return <Header />;
}
