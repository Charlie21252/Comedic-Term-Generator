"use client";

import { useState } from "react";
import UnlockModal from "./UnlockModal";

export default function PaywallModal({ onClose }: { onClose: () => void }) {
  const [showUnlock, setShowUnlock] = useState(false);
  const gumroadUrl = process.env.NEXT_PUBLIC_GUMROAD_PRODUCT_URL ?? "#";

  if (showUnlock) {
    return <UnlockModal onClose={() => setShowUnlock(false)} />;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8 text-center"
        style={{ background: "#0e0e16", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        {/* Icon */}
        <div
          className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-5 mx-auto"
          style={{ background: "rgba(94,106,210,0.12)", border: "1px solid rgba(94,106,210,0.22)" }}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#9BA3F5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="10" width="16" height="11" rx="2" />
            <path d="M7 10V6a4 4 0 0 1 8 0v4" />
          </svg>
        </div>

        <h2
          className="font-archivo font-black text-2xl tracking-tight mb-2"
          style={{ color: "var(--foreground)" }}
        >
          You&apos;ve used your 3 free generations for today
        </h2>
        <p className="text-sm mb-8" style={{ color: "var(--foreground-muted)" }}>
          Unlock unlimited generations, save terms to your personal library, and come back whenever inspiration strikes.
        </p>

        <div className="flex flex-col gap-3">
          <a
            href={gumroadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3 rounded-xl font-grotesk font-semibold text-sm transition-all duration-200"
            style={{ background: "#5E6AD2", color: "#fff" }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = "#6B75DB")}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = "#5E6AD2")}
          >
            Unlock Unlimited Access — $4.99
          </a>
          <button
            onClick={() => setShowUnlock(true)}
            className="w-full py-3 rounded-xl font-grotesk font-medium text-sm transition-all duration-200 cursor-pointer"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "var(--foreground-muted)",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.color = "var(--foreground)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.2)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.color = "var(--foreground-muted)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)";
            }}
          >
            Already have a key? Enter it here
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-5 text-xs transition-colors duration-200 cursor-pointer"
          style={{ color: "var(--foreground-muted)" }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "var(--foreground)")}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "var(--foreground-muted)")}
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
