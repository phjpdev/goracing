"use client";

import { useAuth } from "@/lib/context/AuthContext";

export function FloatingTelegram() {
  const { auth } = useAuth();
  // Hide when not logged in (landing/login/signup) and for members.
  if (!auth?.authenticated) return null;
  if (auth.role === "member") return null;

  return (
    <>
      <style>{`
        @keyframes fadeInScale {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
      <a
        href="https://t.me"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Telegram"
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] right-5 z-50 bg-[#229ED9] p-3 sm:p-5 rounded-full shadow-lg hover:bg-[#1e8cc4] transition-colors flex items-center justify-center"
        style={{ animation: "fadeInScale 0.4s ease-out 1s both" }}
      >
        <svg
          stroke="currentColor"
          fill="currentColor"
          strokeWidth="0"
          viewBox="0 0 448 512"
          className="text-white text-3xl sm:text-4xl pr-0.5"
          height="1em"
          width="1em"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M446.7 98.6l-67.6 318.8c-5.1 22.5-18.4 28.1-37.3 17.5l-103-75.9-49.7 47.8c-5.5 5.5-10.1 10.1-20.7 10.1l7.4-104.9 190.9-172.5c8.3-7.4-1.8-11.5-12.9-4.1L117.8 284 16.2 252.2c-22.1-6.9-22.5-22.1 4.6-32.7L418.2 66.4c18.4-6.9 34.5 4.1 28.5 32.2z" />
        </svg>
      </a>
    </>
  );
}
