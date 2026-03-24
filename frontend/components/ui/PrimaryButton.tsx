import Link from "next/link";
import { type ButtonHTMLAttributes, type ReactNode } from "react";

export const PRIMARY_CTA_CLASS =
  "inline-flex h-[54px] min-w-[120px] lg:min-w-0 items-center justify-center rounded-full px-6 sm:px-8 py-[17px] font-inter text-[15px] sm:text-[16px] font-medium leading-[1] tracking-[-0.03em] text-[#020308] focus:outline-none focus:ring-2 focus:ring-[#28E88E] focus:ring-offset-2 focus:ring-offset-black transition-opacity hover:opacity-95 [background:linear-gradient(0deg,#28E88E,#28E88E),radial-gradient(44.33%_44.33%_at_50.2%_0%,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0)_100%)] [box-shadow:0px_7px_16px_0px_#28E88E33,0px_30px_30px_0px_#28E88E2B,0px_67px_40px_0px_#28E88E1A,0px_119px_47px_0px_#28E88E08,0px_185px_52px_0px_#28E88E00]";

const PRIMARY_BUTTON_CLASS =
  "w-full h-12 sm:h-[54px] rounded-full font-inter text-[15px] sm:text-[16px] font-medium text-[#020308] tracking-[-0.03em] focus:outline-none focus:ring-2 focus:ring-[#28E88E] focus:ring-offset-2 focus:ring-offset-black transition-opacity hover:opacity-95 [background:linear-gradient(0deg,#28E88E,#28E88E),radial-gradient(44.33%_44.33%_at_50.2%_0%,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0)_100%)] [box-shadow:0px_7px_16px_0px_#28E88E33,0px_30px_30px_0px_#28E88E2B,0px_67px_40px_0px_#28E88E1A,0px_119px_47px_0px_#28E88E08,0px_185px_52px_0px_#28E88E00]";

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  className?: string;
};

export function PrimaryButton({ children, className = "", ...props }: PrimaryButtonProps) {
  return (
    <button type="submit" className={`${PRIMARY_BUTTON_CLASS} ${className}`} {...props}>
      {children}
    </button>
  );
}

type PrimaryLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

export function PrimaryLink({ href, children, className = "" }: PrimaryLinkProps) {
  return (
    <Link href={href} className={`${PRIMARY_CTA_CLASS} no-underline ${className}`}>
      {children}
    </Link>
  );
}
