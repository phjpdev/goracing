"use client";

import { useEffect } from "react";

type MediaLightboxProps = {
  /** Stored media path, e.g. "/uploads/records/x.jpg". Pass null to close. */
  src: string | null;
  onClose: () => void;
};

function isVideo(url: string) {
  return /\.(mp4|webm|mov|avi)$/i.test(url);
}

export function MediaLightbox({ src, onClose }: MediaLightboxProps) {
  useEffect(() => {
    if (!src) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [src, onClose]);

  if (!src) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <button
        type="button"
        className="absolute top-6 right-6 text-3xl leading-none text-white/60 transition-colors hover:text-white"
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </button>

      {isVideo(src) ? (
        <video
          src={`/api${src}`}
          className="max-h-[90vh] max-w-full rounded-lg"
          controls
          autoPlay
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <img
          src={`/api${src}`}
          alt=""
          className="max-h-[90vh] max-w-full rounded-lg object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      )}
    </div>
  );
}
