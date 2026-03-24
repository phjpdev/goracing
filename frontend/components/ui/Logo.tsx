import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

const LOGO_IMAGE = "/assets/Group.png";

export function Logo({
  className = "",
  accentUnderline = false,
}: {
  className?: string;
  accentUnderline?: boolean;
}) {
  return (
    <Link
      href={ROUTES.HOME}
      className={`inline-flex items-center gap-2 text-inherit no-underline ${className}`}
    >
      <div className="flex h-[30px] w-[48px] items-center justify-center shrink-0">
        <Image src={LOGO_IMAGE} alt="Go Racing logo" width={40} height={28} />
      </div>
      <span className="inline-flex items-baseline gap-1 text-[22px] font-medium leading-[1.4]">
        <span className="text-white">Go</span>
        <span
          className={
            accentUnderline
              ? "text-[#fbbf24] decoration-orange-400/70 decoration-2 underline-offset-1"
              : "text-[#fbbf24]"
          }
        >
          Racing
        </span>
      </span>
    </Link>
  );
}

/** Compact logo for auth pages (responsive sizing) */
export function LogoCompact({ className = "" }: { className?: string }) {
  return (
    <Link
      href={ROUTES.HOME}
      className={`inline-flex items-center gap-2 text-inherit no-underline ${className}`}
    >
      <div className="flex h-[26px] w-[40px] sm:h-[30px] sm:w-[48px] items-center justify-center shrink-0">
        <Image
          src={LOGO_IMAGE}
          alt="Go Racing logo"
          width={40}
          height={28}
          className="w-8 h-[22px] sm:w-10 sm:h-7"
        />
      </div>
      <span className="inline-flex items-baseline gap-1 font-inter text-[18px] sm:text-[22px] font-medium leading-[1.4]">
        <span className="text-white">Go</span>
        <span className="text-[#fbbf24]">Racing</span>
      </span>
    </Link>
  );
}
