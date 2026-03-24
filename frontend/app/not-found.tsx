import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0d0d0d] text-white">
      <p className="font-inter text-6xl font-bold text-[#28E88E]">404</p>
      <h2 className="font-inter text-2xl font-semibold">Page not found</h2>
      <p className="font-inter text-sm text-white/60">The page you are looking for does not exist.</p>
      <Link
        href={ROUTES.HOME}
        className="mt-2 rounded-full border border-white/20 px-6 py-2 font-inter text-sm text-white transition hover:bg-white/10 no-underline"
      >
        Go home
      </Link>
    </div>
  );
}
