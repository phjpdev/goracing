import type { Metadata, Viewport } from "next";
import { ConditionalHeader, MobileBottomNav } from "@/components/layout";
import { AuthProvider } from "@/lib/context/AuthContext";
import { LanguageProvider } from "@/lib/context/LanguageContext";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Go Racing | 賽馬智能分析",
  description: "AI-powered horse racing analytics platform. 將複雜的賽馬數據轉化為清晰、自信的決策。",
  icons: {
    icon: "/assets/logo.png",
    apple: "/assets/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body className="overflow-x-hidden font-sans bg-black text-white flex min-h-dvh flex-col md:min-h-screen">
        <LanguageProvider>
          <AuthProvider>
            <ConditionalHeader />
            <div className="flex min-h-0 flex-1 flex-col pb-[calc(42px+env(safe-area-inset-bottom,0px))] md:pb-0">
              {children}
            </div>
            <MobileBottomNav />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
