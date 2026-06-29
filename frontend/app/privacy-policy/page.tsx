"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/context/LanguageContext";
import { ROUTES } from "@/lib/constants";

export default function PrivacyPolicyPage() {
  const { t } = useLanguage();
  const { title, lastUpdated, sections } = t.privacyPolicyPage;

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-8 sm:py-12">
      <Link
        href={ROUTES.SIGNUP}
        className="font-inter text-[13px] text-[#28E88E] hover:underline mb-6 inline-block"
      >
        ← {t.auth.signupTitle}
      </Link>

      <h1 className="font-inter text-[28px] sm:text-[32px] font-semibold text-white mb-2">
        {title}
      </h1>
      <p className="font-inter text-[13px] text-[#B3B3B3] mb-8">{lastUpdated}</p>

      <div className="flex flex-col gap-6">
        {sections.map((section) => (
          <section
            key={section.heading}
            className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-5 sm:px-6 sm:py-6"
          >
            <h2 className="font-inter text-[16px] sm:text-[18px] font-semibold text-white mb-3">
              {section.heading}
            </h2>
            <p className="font-inter text-[14px] sm:text-[15px] font-light leading-[1.7] text-[#B3B3B3]">
              {section.body}
            </p>
          </section>
        ))}
      </div>
    </main>
  );
}
