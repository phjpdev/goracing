"use client";

import Image from "next/image";
import Link from "next/link";
import { PrimaryLink } from "@/components/ui";
import { ROUTES } from "@/lib/constants";
import { useAuth } from "@/lib/context/AuthContext";
import { useLanguage } from "@/lib/context/LanguageContext";

export function HeroSection() {
  const { auth } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="min-w-0 overflow-x-hidden relative">
      <main className="relative">
        <div className="relative mx-auto w-full max-w-[1360px] overflow-hidden px-5 sm:px-6 lg:px-10">
          <div className="relative flex flex-col lg:grid lg:h-[75svh] w-full lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            {/* Hero image */}
            <section className="relative h-[45svh] lg:h-auto lg:flex items-stretch overflow-hidden order-1 lg:order-2">
              <div className="relative h-full w-full overflow-hidden">
                <Image
                  src="/assets/hero-image.png"
                  alt="Horse racing"
                  width={1066}
                  height={1200}
                  className="h-full w-full object-cover object-[70%_30%] lg:object-center [transform:rotateY(180deg)]"
                  priority
                />
                {/* Mobile bottom fade */}
                <div
                  className="pointer-events-none absolute inset-0 z-[1] lg:hidden"
                  style={{ background: "linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 25%, transparent 50%)" }}
                  aria-hidden
                />
                {/* Desktop left fade */}
                <div
                  className="pointer-events-none absolute inset-0 z-[1] hidden lg:block"
                  style={{ background: "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 30%, transparent 60%)" }}
                  aria-hidden
                />
                {/* Desktop bottom fade */}
                <div
                  className="pointer-events-none absolute inset-0 z-[1] hidden lg:block"
                  style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 30%)" }}
                  aria-hidden
                />
              </div>
            </section>

            {/* Hero text */}
            <section className="relative z-10 flex flex-col gap-5 order-2 lg:order-1 px-5 pt-6 pb-8 lg:justify-center lg:pt-0 lg:pb-0 lg:pl-2 lg:pr-12">
              <h1 className="text-[32px] leading-[1.15] font-semibold tracking-[-0.01em] text-white sm:text-[42px] lg:text-[56px] lg:leading-[1.2] lg:whitespace-nowrap">
                {t.hero.title}
              </h1>

              <p className="max-w-[440px] font-inter text-[14px] font-light leading-[1.6] tracking-[0.01em] text-white/70 sm:text-[15px] lg:text-[17px] lg:text-white/60">
                {t.hero.description}
              </p>

              <div className="mt-2 lg:mt-4 flex flex-row flex-wrap items-center justify-start gap-3 sm:gap-4">
                {!auth?.authenticated && (
                  <PrimaryLink href={ROUTES.LOGIN}>{t.hero.login}</PrimaryLink>
                )}
                <Link
                  href={ROUTES.MATCHES}
                  prefetch={false}
                  className="inline-flex h-[48px] lg:h-[52px] items-center justify-center rounded-full border border-white/30 bg-white/5 px-6 lg:px-7 font-inter text-[14px] lg:text-[15px] font-normal leading-[1.4] text-white backdrop-blur-sm transition-colors hover:bg-white/10 no-underline"
                >
                  {t.hero.viewMatches}
                </Link>
              </div>

              {/* Stats: desktop only */}
              <div className="mt-8 hidden lg:block">
                <div className="h-px w-full max-w-[320px] bg-gradient-to-r from-white/30 to-transparent" />
                <div className="mt-5 flex gap-12">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-sans text-[28px] font-bold leading-[1.3] tracking-[-0.01em] text-white">15</span>
                    <span className="whitespace-nowrap font-inter text-[13px] font-light leading-[1.4] tracking-[0.02em] text-white/40 uppercase">
                      {t.hero.liveRacesToday}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-sans text-[28px] font-bold leading-[1.3] tracking-[-0.01em] text-white">88.3%</span>
                    <span className="whitespace-nowrap font-inter text-[13px] font-light leading-[1.4] tracking-[0.02em] text-white/40 uppercase">
                      {t.hero.modelAccuracy}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Decorative ellipses – desktop only */}
            <div
              className="pointer-events-none absolute z-10 rounded-full hidden lg:block"
              style={{ width: "500px", height: "40px", right: "80px", top: "60px", background: "rgba(255, 255, 255, 0.6)", filter: "blur(60px)", transform: "rotate(-25deg)" }}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute z-10 rounded-full hidden lg:block"
              style={{ width: "400px", height: "60px", right: "160px", top: "50%", background: "rgba(255, 255, 255, 0.4)", filter: "blur(60px)", transform: "rotate(-25deg)" }}
              aria-hidden
            />
          </div>
        </div>
      </main>

      {/* Mobile-only stats */}
      <section
        className="lg:hidden w-full pt-6 pb-20 px-5"
        style={{ background: "linear-gradient(180deg, #111 0%, #000 100%)" }}
      >
        <div className="grid grid-cols-2 gap-6 max-w-[400px] mx-auto">
          <div className="flex flex-col items-center justify-center gap-0.5 text-center">
            <span className="font-sans text-[28px] font-bold leading-[1.3] text-white">15</span>
            <span className="font-inter text-[13px] font-light leading-[1.4] tracking-[0.02em] text-white/50 uppercase">{t.hero.liveRacesToday}</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-0.5 text-center">
            <span className="font-sans text-[28px] font-bold leading-[1.3] text-white">88.3%</span>
            <span className="font-inter text-[13px] font-light leading-[1.4] tracking-[0.02em] text-white/50 uppercase">{t.hero.modelAccuracy}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
