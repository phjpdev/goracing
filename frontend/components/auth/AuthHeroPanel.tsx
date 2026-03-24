"use client";

import Image from "next/image";
import { LogoCompact } from "@/components/ui/Logo";
import { useLanguage } from "@/lib/context/LanguageContext";

const AUTH_IMAGE = "/assets/auth-page.png";
const HERO_GRADIENT =
  "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.95) 100%)";

export function AuthHeroPanel() {
  const { t } = useLanguage();

  return (
    <div className="relative w-full lg:w-[45%] h-[45vh] sm:h-[50vh] lg:h-screen min-h-[280px] order-1 shrink-0">
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={AUTH_IMAGE}
          alt="Horse racing"
          fill
          className="object-cover object-center object-left-top lg:object-center"
          priority
        />
        <div className="absolute inset-0" style={{ background: HERO_GRADIENT }} />
      </div>
      <div className="absolute bottom-6 left-4 right-4 sm:bottom-8 sm:left-6 sm:right-6 lg:bottom-28 lg:left-20 lg:right-20 z-10">
        <LogoCompact className="mb-4 sm:mb-5" />
        <h1 className="text-[28px] sm:text-[40px] lg:text-[56px] font-medium leading-[1.2] text-white mb-2 sm:mb-3">
          {t.hero.title}
        </h1>
        <p className="font-inter text-[14px] sm:text-[16px] font-light leading-[1.5] text-[#B3B3B3] whitespace-normal lg:whitespace-nowrap max-w-full">
          {t.hero.description}
        </p>
      </div>
    </div>
  );
}
