import type { Metadata } from "next";
import { Header } from "@/components/layout";
import { AuthProvider } from "@/lib/context/AuthContext";
import { LanguageProvider } from "@/lib/context/LanguageContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Go Racing | 賽馬智能分析",
  description: "AI-powered horse racing analytics platform. 將複雜的賽馬數據轉化為清晰、自信的決策。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body className="overflow-x-hidden font-sans bg-black text-white">
        <LanguageProvider>
          <AuthProvider>
            <Header />
            {children}
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
