"use client";

export function DisclaimerSection() {
  return (
    <section className="mx-auto mt-6 sm:mt-8 w-full max-w-[1360px] px-5 sm:px-6 lg:px-10">
      <div className="rounded-[16px] border border-white/[0.08] bg-white/[0.03] px-5 py-3 sm:px-6 sm:py-4">
        <p className="mx-auto max-w-[980px] font-inter text-[15px] sm:text-[16px] font-light leading-[1.6] text-white/50 text-center">
          用戶使用本系統提供的足球分析數據時，必須只透過香港賽馬會（HKJC）足智彩等香港合法投注平台進行任何投注。本系統不提供、不推廣亦不便利任何非法投注活動。未滿18歲人士不得投注。如有需要尋求輔導，可致電平和基金熱線 1834 633。
        </p>
      </div>
    </section>
  );
}

