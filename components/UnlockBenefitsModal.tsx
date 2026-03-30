"use client";

import { useState } from "react";
import UnlockModal from "./UnlockModal";

const BENEFITS = [
  {
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7.5 1v4M7.5 10v4M1 7.5h4M10 7.5h4" />
        <circle cx="7.5" cy="7.5" r="3" />
      </svg>
    ),
    title: "Unlimited term generations",
    detail: "Free users get 3 per day",
  },
  {
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2.5 1.5h10a1 1 0 0 1 1 1v11l-6-3-6 3v-11a1 1 0 0 1 1-1z" />
      </svg>
    ),
    title: "Personal saved terms library",
    detail: "Save and revisit your favourites",
  },
  {
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7.5 1.5l1.545 3.13 3.455.502-2.5 2.437.59 3.44L7.5 9.385l-3.09 1.624.59-3.44L2.5 5.132l3.455-.502z" />
      </svg>
    ),
    title: "All future features included",
    detail: "Everything we build next, at no extra cost",
  },
];

export default function UnlockBenefitsModal({ onClose }: { onClose: () => void }) {
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
        className="w-full max-w-md rounded-2xl p-8"
        style={{ background: "#0e0e16", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        {/* Header */}
        <div className="mb-7">
          <div
            className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(94,106,210,0.12)", border: "1px solid rgba(94,106,210,0.22)" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#5E6AD2", boxShadow: "0 0 6px #5E6AD2" }}
            />
            <span className="text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: "#9BA3F5" }}>
              One-time unlock
            </span>
          </div>
          <h2
            className="font-archivo font-black text-[1.65rem] tracking-[-0.02em] leading-tight mb-1"
            style={{ color: "var(--foreground)" }}
          >
            Unlock Full Access
          </h2>
          <p className="font-grotesk text-sm" style={{ color: "var(--foreground-muted)" }}>
            Everything, forever. No subscription.
          </p>
        </div>

        {/* Benefits */}
        <ul className="flex flex-col gap-3 mb-7">
          {BENEFITS.map(b => (
            <li
              key={b.title}
              className="flex items-start gap-3.5 p-3.5 rounded-xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span
                className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg mt-0.5"
                style={{ background: "rgba(94,106,210,0.12)", color: "#9BA3F5" }}
              >
                {b.icon}
              </span>
              <div>
                <p className="font-grotesk font-semibold text-sm leading-snug" style={{ color: "var(--foreground)" }}>
                  {b.title}
                </p>
                <p className="font-grotesk text-xs mt-0.5" style={{ color: "var(--foreground-muted)" }}>
                  {b.detail}
                </p>
              </div>
            </li>
          ))}
        </ul>

        {/* Pricing note */}
        <p
          className="font-grotesk text-xs text-center mb-5"
          style={{ color: "var(--foreground-muted)" }}
        >
          No subscription. No recurring charges.{" "}
          <span style={{ color: "var(--foreground)" }}>Pay once, use forever.</span>
        </p>

        {/* CTAs */}
        <div className="flex flex-col gap-2.5">
          <a
            href={gumroadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3 rounded-xl font-grotesk font-semibold text-sm text-center transition-all duration-200"
            style={{ background: "#5E6AD2", color: "#fff" }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = "#6B75DB")}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = "#5E6AD2")}
          >
            Unlock Full Access — $4.99
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
          className="mt-5 w-full text-xs transition-colors duration-200 cursor-pointer"
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
