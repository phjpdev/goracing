export function ConnectSection() {
  return (
    <section className="mx-auto mt-12 sm:mt-16 lg:mt-[80px] w-full max-w-[1360px] px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16">
      <h2 className="text-[24px] sm:text-[28px] lg:text-[32px] font-medium leading-[1.3] text-white">
        Connect With Digital Paddock
      </h2>
      <p className="mt-3 max-w-[560px] font-inter text-[14px] sm:text-[16px] font-light leading-[1.5] text-white/90">
        Need help or have questions about the platform? Our team is here to support your racing analytics journey.
      </p>
      <a
        href="mailto:support@digitalpaddock.ai"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#2d2d2d] px-6 py-3 font-inter text-[14px] sm:text-[16px] font-medium text-[#eab308] no-underline transition hover:bg-[#3a3a3a]"
      >
        support@digitalpaddock.ai
        <span className="text-[#eab308]" aria-hidden>
          ↗
        </span>
      </a>
    </section>
  );
}
