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
    <div
      className="min-w-0 overflow-x-hidden relative"
      style={{ background: "linear-gradient(152.57deg, #282828 15.06%, #141414 60.23%)" }}
    >
      <main className="bg-black">
        <div className="relative mx-auto w-full max-w-[1440px] overflow-visible px-0 lg:px-8">
          <div className="relative grid min-h-[55vh] lg:min-h-0 h-auto lg:h-[700px] w-full gap-8 lg:gap-12 border-t-0 lg:border-t border-r border-b border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.9)] grid-cols-1 lg:grid-cols-[1fr_1000px] rounded-b-none lg:rounded-b-[32px] py-0 lg:py-0">
            {/* Hero image */}
            <section className="absolute inset-0 lg:relative lg:flex justify-end overflow-visible order-2 min-h-0">
              <div className="relative h-full w-full overflow-hidden rounded-b-none lg:rounded-b-[32px]">
                <Image
                  src="/assets/hero-image.png"
                  alt="Horse racing"
                  width={1066}
                  height={1200}
                  className="h-full w-full object-cover object-[70%_50%] lg:object-center [transform:rotateY(180deg)]"
                  priority
                />
                <div
                  className="pointer-events-none absolute inset-0 z-[1] lg:hidden"
                  style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.35) 28%, transparent 55%)" }}
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute inset-0 z-[1] lg:hidden"
                  style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.55) 38%, transparent 72%)" }}
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute inset-0 z-[1] hidden bg-[linear-gradient(90deg,rgba(5,6,8,0.98)_0%,rgba(5,6,8,0.8)_22%,rgba(5,6,8,0)_55%)] lg:block"
                  aria-hidden
                />
              </div>
            </section>

            <section className="relative z-10 flex flex-col justify-end gap-5 order-1 px-4 pt-[38vh] min-h-[55vh] pb-6 lg:justify-center lg:pt-0 lg:px-0 lg:min-h-0 lg:pb-0">
              <h1 className="text-[50px] leading-[1.2] font-medium tracking-[0] text-white lg:text-[56px] lg:leading-[1.4] lg:whitespace-nowrap">
                {t.hero.title}
              </h1>

              <p className="max-w-[430px] font-inter text-[16px] font-light leading-[1.4] tracking-[0.01em] text-white lg:text-[#B3B3B3]">
                {t.hero.description}
              </p>

              <div className="mt-6 flex flex-row flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4">
                {!auth?.authenticated && (
                  <PrimaryLink href={ROUTES.LOGIN}>{t.hero.login}</PrimaryLink>
                )}
                <Link
                  href={ROUTES.MATCHES}
                  prefetch={false}
                  className="inline-flex h-[54px] items-center justify-center rounded-full border border-white/50 bg-black/40 lg:bg-transparent px-6 py-[17px] font-inter text-[16px] font-normal leading-[1.4] tracking-[0] text-white lg:border-white/40 lg:px-8 no-underline"
                >
                  {t.hero.viewMatches}
                </Link>
              </div>

              {/* Stats: desktop only */}
              <div className="mt-2 hidden lg:block">
                <div className="h-px w-full border-t border-transparent [border-image:linear-gradient(90deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_100%)_1]" />
                <div className="mt-6 flex flex-wrap gap-6 sm:gap-10 text-center">
                  <div className="flex flex-col gap-1">
                    <span className="font-sans text-[26px] font-semibold leading-[1.4] tracking-[0.01em] text-white">15</span>
                    <span className="whitespace-nowrap font-inter text-[14px] font-light leading-[1.4] tracking-[0.01em] text-[#707687]">
                      {t.hero.liveRacesToday}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-sans text-[26px] font-semibold leading-[1.4] tracking-[0.01em] text-white">88.3%</span>
                    <span className="whitespace-nowrap font-inter text-[14px] font-light leading-[1.4] tracking-[0.01em] text-[#707687]">
                      {t.hero.modelAccuracy}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Decorative ellipses – desktop only */}
            <div
              className="pointer-events-none absolute z-10 rounded-full hidden lg:block"
              style={{ width: "600px", height: "50px", right: "100px", top: "0", background: "rgba(255, 255, 255, 0.8)", filter: "blur(50px)", transform: "rotate(-25deg)" }}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute z-10 rounded-full hidden lg:block"
              style={{ width: "500px", height: "80px", right: "200px", top: "300px", background: "rgba(255, 255, 255, 0.8)", filter: "blur(50px)", transform: "rotate(-25deg)" }}
              aria-hidden
            />
          </div>
        </div>
      </main>

      {/* Mobile-only stats */}
      <section
        className="lg:hidden w-full pt-5 pb-24 px-4"
        style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 50%, #000000 100%)" }}
      >
        <div className="grid grid-cols-2 gap-4 max-w-[1360px] mx-auto">
          <div className="flex flex-col items-center justify-center gap-1 text-center">
            <span className="font-sans text-[26px] font-semibold leading-[1.4] tracking-[0.01em] text-white">15</span>
            <span className="font-inter text-[14px] font-light leading-[1.4] tracking-[0.01em] text-white">{t.hero.liveRacesToday}</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 text-center">
            <span className="font-sans text-[26px] font-semibold leading-[1.4] tracking-[0.01em] text-white">88.3%</span>
            <span className="font-inter text-[14px] font-light leading-[1.4] tracking-[0.01em] text-white">{t.hero.modelAccuracy}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
