import { Logo } from "@/components/ui";

export function Footer() {
  return (
    <footer className="mx-auto w-full max-w-[1360px] border-t border-white/[0.08] px-5 sm:px-6 lg:px-10 py-6">
      <div className="flex w-full flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <Logo className="opacity-90" />
        <span className="font-inter text-[13px] text-white/40">
          Copyright © 2026 GoRacing
        </span>
      </div>
    </footer>
  );
}
