export function ConnectSection() {
  return (
    <section className="mx-auto mt-16 sm:mt-24 lg:mt-32 w-full max-w-[1360px] px-5 sm:px-6 lg:px-10 pb-16 lg:pb-20">
      <div className="rounded-[20px] border border-white/[0.08] bg-white/[0.03] px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16 text-center">
        <h2 className="text-[24px] sm:text-[28px] lg:text-[32px] font-semibold leading-[1.2] tracking-[-0.01em] text-white">
          Connect With Digital Paddock
        </h2>
        <p className="mx-auto mt-4 max-w-[480px] font-inter text-[15px] sm:text-[16px] font-light leading-[1.6] text-white/50">
          Need help or have questions about the platform? Our team is here to support your racing analytics journey.
        </p>
        <a
          href="mailto:support@digitalpaddock.ai"
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#eab308]/30 bg-[#eab308]/10 px-7 py-3.5 font-inter text-[15px] font-medium text-[#eab308] no-underline transition-colors hover:bg-[#eab308]/20"
        >
          support@digitalpaddock.ai
          <span className="text-[#eab308]" aria-hidden>
            ↗
          </span>
        </a>
      </div>
    </section>
  );
}
