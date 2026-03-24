import { type ReactNode } from "react";
import { AuthHeroPanel } from "./AuthHeroPanel";

type AuthFormLayoutProps = {
  children: ReactNode;
};

export function AuthFormLayout({ children }: AuthFormLayoutProps) {
  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden flex flex-col lg:flex-row bg-black">
      <AuthHeroPanel />
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:p-6 lg:p-12 bg-black order-2 min-h-0">
        <div className="w-full max-w-[400px] px-1 sm:px-0">{children}</div>
      </div>
    </div>
  );
}
