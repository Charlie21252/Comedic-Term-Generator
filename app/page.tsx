"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import TermForm from "@/components/TermForm";
import TermCard from "@/components/TermCard";
import PaywallModal from "@/components/PaywallModal";
import UnlockBenefitsModal from "@/components/UnlockBenefitsModal";

interface Term {
  term: string;
  definition: string;
  example: string;
}

const FREE_LIMIT = 3;

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

function getGenerationCount(): number {
  const storedDate = localStorage.getItem("generationDate");
  const today = getTodayString();
  if (storedDate !== today) {
    localStorage.setItem("generationDate", today);
    localStorage.setItem("generationCount", "0");
    return 0;
  }
  return parseInt(localStorage.getItem("generationCount") ?? "0", 10);
}

function incrementGenerationCount() {
  const count = getGenerationCount();
  localStorage.setItem("generationCount", String(count + 1));
}

function isUnlocked(): boolean {
  return !!localStorage.getItem("licenseKey");
}

export default function Home() {
  const [terms, setTerms] = useState<Term[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSituation, setLastSituation] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showBenefits, setShowBenefits] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    setUnlocked(!!localStorage.getItem("licenseKey"));
  }, []);

  const generateTerms = useCallback(async (situation: string) => {
    // Check generation limit for free users
    if (!isUnlocked()) {
      const count = getGenerationCount();
      if (count >= FREE_LIMIT) {
        setShowPaywall(true);
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    setLastSituation(situation);

    try {
      const res = await fetch("/api/generate-term", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation }),
      });

      if (res.status === 429) {
        const retryAfter = res.headers.get("Retry-After");
        const seconds = retryAfter ? parseInt(retryAfter, 10) : 60;
        setError(`Slow down — you've hit the limit. Try again in ${seconds}s.`);
        return;
      }

      if (res.status === 400) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Invalid input. Please check your text and try again.");
        return;
      }

      if (!res.ok) {
        setError("Something went wrong. Please try again.");
        return;
      }

      const data = await res.json();
      setTerms(data.terms);

      // Increment count only after a successful generation
      if (!isUnlocked()) {
        incrementGenerationCount();
      }
    } catch (err) {
      console.error("[generate-term] fetch error:", err);
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <main className="min-h-dvh">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Comedic Term Generator",
            description:
              "Describe any situation and instantly get clever, witty terms for it.",
            url: "https://comedicterm.com/",
            applicationCategory: "EntertainmentApplication",
            offers: {
              "@type": "Offer",
              price: "free",
              priceCurrency: "USD",
            },
          }),
        }}
      />
      {/* Ambient blob — decorative, hidden from screen readers */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[700px] h-[480px] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(ellipse, #5E6AD2 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative max-w-[680px] mx-auto px-5 pt-[72px] pb-28">

        {/* Header */}
        <header className="mb-10">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(94,106,210,0.12)", border: "1px solid rgba(94,106,210,0.22)" }}>
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#5E6AD2", boxShadow: "0 0 6px #5E6AD2" }}
            />
            <span className="text-[11px] font-semibold tracking-[0.12em] uppercase"
              style={{ color: "#9BA3F5" }}>
              AI Word Engine
            </span>
          </div>

          {/* Title */}
          <h1 className="font-archivo leading-[0.95] tracking-[-0.03em] mb-6">
            <span
              className="block text-[52px] sm:text-[68px] font-[300]"
              style={{ color: "var(--foreground-muted)" }}
            >
              Comedic
            </span>
            <span
              className="block text-[52px] sm:text-[68px] font-[900]"
              style={{ color: "var(--foreground)" }}
            >
              Term Generator
            </span>
          </h1>

          {/* Nav links + unlock CTA */}
          <nav className="flex items-center gap-2 flex-wrap" aria-label="Site navigation">
            <Link
              href="/examples"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-grotesk font-medium tracking-[0.04em] transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "var(--foreground-muted)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--foreground)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.15)";
                (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.07)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--foreground-muted)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.08)";
                (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.04)";
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="1" y="1" width="4" height="4" rx="0.8" />
                <rect x="7" y="1" width="4" height="4" rx="0.8" />
                <rect x="1" y="7" width="4" height="4" rx="0.8" />
                <rect x="7" y="7" width="4" height="4" rx="0.8" />
              </svg>
              Examples
            </Link>
            <Link
              href="/library"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-grotesk font-medium tracking-[0.04em] transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "var(--foreground-muted)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--foreground)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.15)";
                (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.07)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--foreground-muted)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.08)";
                (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.04)";
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2 1.5h8a.5.5 0 0 1 .5.5v8l-4-2-4 2V2a.5.5 0 0 1 .5-.5z" />
              </svg>
              Library
            </Link>

            {/* Unlock button — only shown to free users */}
            {!unlocked && (
              <button
                onClick={() => setShowBenefits(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-grotesk font-medium tracking-[0.04em] transition-all duration-200 cursor-pointer"
                style={{
                  background: "rgba(94,106,210,0.1)",
                  border: "1px solid rgba(94,106,210,0.28)",
                  color: "#9BA3F5",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(94,106,210,0.18)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(94,106,210,0.45)";
                  (e.currentTarget as HTMLButtonElement).style.color = "#BFC5F8";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(94,106,210,0.1)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(94,106,210,0.28)";
                  (e.currentTarget as HTMLButtonElement).style.color = "#9BA3F5";
                }}
              >
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="1.5" y="5" width="8" height="5.5" rx="1" />
                  <path d="M3.5 5V3.5a2 2 0 0 1 4 0V5" />
                </svg>
                Unlock Full Access
              </button>
            )}
          </nav>
        </header>

        {/* Form */}
        <TermForm onSubmit={generateTerms} isLoading={isLoading} />

        {/* Loading skeleton */}
        {isLoading && (
          <div aria-live="polite" aria-label="Finding the words" className="mt-10 flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 animate-pulse"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", opacity: 1 - i * 0.2 }}
              >
                <div className="h-7 w-2/5 rounded-lg mb-3" style={{ background: "rgba(255,255,255,0.07)" }} />
                <div className="h-4 w-4/5 rounded mb-2" style={{ background: "rgba(255,255,255,0.05)" }} />
                <div className="h-4 w-3/5 rounded" style={{ background: "rgba(255,255,255,0.04)" }} />
              </div>
            ))}
            <p className="text-center text-sm mt-2" style={{ color: "var(--foreground-muted)" }}>
              Finding the words...
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mt-8 p-4 rounded-2xl text-sm text-center"
            style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)", color: "#F87171" }}
          >
            {error}
          </div>
        )}

        {/* Results */}
        {terms.length > 0 && !isLoading && (
          <section className="mt-10" aria-label="Generated terms">
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs font-semibold tracking-[0.1em] uppercase" style={{ color: "var(--foreground-muted)" }}>
                {terms.length} terms
              </span>
              <button
                onClick={() => lastSituation && generateTerms(lastSituation)}
                className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl font-medium cursor-pointer transition-all duration-200 easing-smooth"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground-muted)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--foreground)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.16)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--foreground-muted)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M1 7a6 6 0 1 0 6-6"/>
                  <path d="M1 2.5V7h4.5"/>
                </svg>
                Regenerate
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {terms.map((term, i) => (
                <TermCard key={i} term={term} index={i} situation={lastSituation} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="pb-8 text-center">
        <span className="text-xs" style={{ color: "rgba(138,143,152,0.35)" }}>
          comedicterm.com
        </span>
      </footer>

      {/* Paywall modal */}
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}

      {/* Benefits modal */}
      {showBenefits && <UnlockBenefitsModal onClose={() => setShowBenefits(false)} />}
    </main>
  );
}
