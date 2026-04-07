"use client";

import { useLanguage } from "@/lib/context/LanguageContext";

export function DisclaimerSection() {
  const { locale } = useLanguage();

  const text =
    locale === "zh-TW"
      ? "用戶使用本系統提供的足球分析數據時，必須只透過香港賽馬會（HKJC）賽馬等香港合法投注平台進行任何投注。本系統不提供、不推廣亦不便利任何非法投注活動。未滿18歲人士不得投注。如有需要尋求輔導，可致電平和基金熱線 1834 633。"
      : "When using the football analysis data provided by this system, users must place any bets only through legal Hong Kong betting platforms such as the Hong Kong Jockey Club (HKJC) horse racing. This system does not provide, promote, or facilitate any illegal betting activities. Persons under 18 are not permitted to bet. If you need counseling support, please call the Ping Wo Fund hotline at 1834 633.";

  return (
    <section className="mx-auto mt-6 sm:mt-8 w-full max-w-[1360px] px-5 sm:px-6 lg:px-10">
      <div className="rounded-[16px] border border-white/[0.08] bg-white/[0.03] px-5 py-3 sm:px-6 sm:py-4">
        <p className="mx-auto max-w-[980px] font-inter text-[15px] sm:text-[16px] font-light leading-[1.6] text-white/50 text-center">
          {text}
        </p>
      </div>
    </section>
  );
}

