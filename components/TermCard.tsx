"use client";

import { useState } from "react";

interface Term {
  term: string;
  definition: string;
  example: string;
}

// Each card gets a distinct gradient accent — cinematic palette
const ACCENTS = [
  { from: "#5E6AD2", to: "#8B93E8" }, // indigo
  { from: "#7C3AED", to: "#A78BFA" }, // violet
  { from: "#2563EB", to: "#60A5FA" }, // blue
  { from: "#0891B2", to: "#67E8F9" }, // cyan
  { from: "#059669", to: "#6EE7B7" }, // emerald
];

export default function TermCard({
  term,
  index,
  situation,
}: {
  term: Term;
  index: number;
  situation: string | null;
}) {
  const [copied, setCopied]     = useState(false);
  const [hovered, setHovered]   = useState(false);
  const [voted, setVoted]       = useState<"like" | "dislike" | null>(null);
  const [voting, setVoting]     = useState(false);
  const accent = ACCENTS[index % ACCENTS.length];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(term.term);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleVote = async (vote: "like" | "dislike") => {
    if (voted || voting || !situation) return;
    setVoting(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term: term.term, situation, vote }),
      });
      setVoted(vote);
    } catch {
      // Silently fail — feedback is non-critical
    } finally {
      setVoting(false);
    }
  };

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative flex gap-4 rounded-2xl p-5 transition-all duration-300 easing-smooth"
      style={{
        background: hovered ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${hovered ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.07)"}`,
        boxShadow: hovered ? "0 8px 32px rgba(0,0,0,0.25)" : "none",
        transform: hovered ? "translateY(-1px)" : "translateY(0)",
      }}
    >
      {/* Left gradient accent bar */}
      <div
        aria-hidden="true"
        className="shrink-0 w-[3px] rounded-full self-stretch"
        style={{
          background: `linear-gradient(180deg, ${accent.from}, ${accent.to})`,
          opacity: hovered ? 1 : 0.6,
          transition: "opacity 0.25s ease",
        }}
      />

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        {/* Term + copy button */}
        <div className="flex items-start justify-between gap-3">
          <h2
            className="font-archivo font-black tracking-[-0.02em] leading-none"
            style={{
              fontSize: "clamp(1.35rem, 3vw, 1.65rem)",
              color: "var(--foreground)",
            }}
          >
            {term.term}
          </h2>

          <button
            onClick={handleCopy}
            aria-label={copied ? "Copied" : `Copy term: ${term.term}`}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-grotesk font-medium text-xs cursor-pointer transition-all duration-200 easing-smooth"
            style={{
              background: copied ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.06)",
              border: `1px solid ${copied ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.1)"}`,
              color: copied ? "#6EE7B7" : "var(--foreground-muted)",
            }}
            onMouseEnter={e => {
              if (!copied) {
                (e.currentTarget as HTMLButtonElement).style.color = "var(--foreground)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.2)";
              }
            }}
            onMouseLeave={e => {
              if (!copied) {
                (e.currentTarget as HTMLButtonElement).style.color = "var(--foreground-muted)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)";
              }
            }}
          >
            {copied ? (
              <>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2 6l3 3 5-5" />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="4" y="4" width="7" height="7" rx="1.5" />
                  <path d="M1 8V2a1 1 0 0 1 1-1h6" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>

        {/* Definition */}
        <p
          className="font-grotesk text-sm leading-relaxed"
          style={{ color: "rgba(237,237,239,0.75)" }}
        >
          {term.definition}
        </p>

        {/* Example */}
        <p
          className="font-grotesk text-sm italic mt-0.5"
          style={{ color: "var(--foreground-muted)" }}
        >
          &ldquo;{term.example}&rdquo;
        </p>

        {/* Feedback */}
        {situation && (
          <div className="flex items-center gap-2 mt-1">
            {voted ? (
              <span
                className="font-grotesk text-xs"
                style={{ color: "var(--foreground-muted)" }}
              >
                thanks for the feedback
              </span>
            ) : (
              <>
                <button
                  onClick={() => handleVote("like")}
                  disabled={voting}
                  aria-label="Like this term"
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-grotesk transition-all duration-200 cursor-pointer disabled:cursor-default"
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "var(--foreground-muted)",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(16,185,129,0.35)";
                    (e.currentTarget as HTMLButtonElement).style.color = "#6EE7B7";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.08)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--foreground-muted)";
                  }}
                >
                  👍
                </button>
                <button
                  onClick={() => handleVote("dislike")}
                  disabled={voting}
                  aria-label="Dislike this term"
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-grotesk transition-all duration-200 cursor-pointer disabled:cursor-default"
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "var(--foreground-muted)",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(220,38,38,0.35)";
                    (e.currentTarget as HTMLButtonElement).style.color = "#F87171";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.08)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--foreground-muted)";
                  }}
                >
                  👎
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
