"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import UnlockModal from "@/components/UnlockModal";

interface SavedTerm {
  _id: string;
  term: string;
  situation: string;
  savedAt: string;
}

export default function LibraryPage() {
  const [licenseKey, setLicenseKey] = useState<string | null>(null);
  const [terms, setTerms] = useState<SavedTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUnlock, setShowUnlock] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const gumroadUrl = process.env.NEXT_PUBLIC_GUMROAD_PRODUCT_URL ?? "#";

  const fetchTerms = useCallback(async (key: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/library?licenseKey=${encodeURIComponent(key)}`);
      if (!res.ok) {
        setError("Could not load your library. Please try again.");
        return;
      }
      const data = await res.json();
      setTerms(data.terms ?? []);
    } catch {
      setError("Could not reach the server. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const key = localStorage.getItem("licenseKey");
    setLicenseKey(key);
    if (key) {
      fetchTerms(key);
    } else {
      setLoading(false);
    }
  }, [fetchTerms]);

  const handleDelete = async (term: SavedTerm) => {
    if (!licenseKey || deletingId === term._id) return;
    setDeletingId(term._id);
    try {
      await fetch(
        `/api/library?licenseKey=${encodeURIComponent(licenseKey)}&term=${encodeURIComponent(term.term)}`,
        { method: "DELETE" }
      );
      setTerms(prev => prev.filter(t => t._id !== term._id));
    } catch {
      // Silently fail
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-dvh">
      {/* Ambient blob */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[700px] h-[480px] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(ellipse, #5E6AD2 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative max-w-[680px] mx-auto px-5 pt-[72px] pb-28">
        {/* Header */}
        <header className="mb-12">
          <div className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(94,106,210,0.12)", border: "1px solid rgba(94,106,210,0.22)" }}>
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#5E6AD2", boxShadow: "0 0 6px #5E6AD2" }}
            />
            <span className="text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: "#9BA3F5" }}>
              Your Collection
            </span>
          </div>
          <h1 className="font-archivo leading-[0.95] tracking-[-0.03em] mb-6">
            <span className="block text-[52px] sm:text-[68px] font-[300]" style={{ color: "var(--foreground-muted)" }}>
              Terms
            </span>
            <span className="block text-[52px] sm:text-[68px] font-[900]" style={{ color: "var(--foreground)" }}>
              Bag
            </span>
          </h1>

          {/* Nav links */}
          <nav className="flex items-center gap-2" aria-label="Site navigation">
            <Link
              href="/"
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
                <path d="M1 6l5-5 5 5" />
                <path d="M2 5.5V11h3V8h2v3h3V5.5" />
              </svg>
              Generator
            </Link>
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
          </nav>
        </header>

        {/* No license key */}
        {!licenseKey && !loading && (
          <div className="text-center py-16">
            <p className="text-base mb-6" style={{ color: "var(--foreground-muted)" }}>
              Purchase a license to save terms to your personal library.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={gumroadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 rounded-xl font-grotesk font-semibold text-sm transition-all duration-200"
                style={{ background: "#5E6AD2", color: "#fff" }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = "#6B75DB")}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = "#5E6AD2")}
              >
                Unlock Unlimited Access — $4.99
              </a>
              <button
                onClick={() => setShowUnlock(true)}
                className="px-6 py-3 rounded-xl font-grotesk font-medium text-sm transition-all duration-200 cursor-pointer"
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
                Already have a key?
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col gap-3 mt-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 animate-pulse"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", opacity: 1 - i * 0.2 }}
              >
                <div className="h-5 w-2/5 rounded-lg mb-3" style={{ background: "rgba(255,255,255,0.07)" }} />
                <div className="h-4 w-3/5 rounded" style={{ background: "rgba(255,255,255,0.05)" }} />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mt-4 p-4 rounded-2xl text-sm text-center"
            style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)", color: "#F87171" }}
          >
            {error}
          </div>
        )}

        {/* Empty state */}
        {licenseKey && !loading && !error && terms.length === 0 && (
          <div className="text-center py-16">
            <p className="text-base mb-4" style={{ color: "var(--foreground-muted)" }}>
              No saved terms yet.
            </p>
            <Link
              href="/"
              className="text-sm font-medium transition-colors duration-200"
              style={{ color: "#9BA3F5" }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--foreground)")}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = "#9BA3F5")}
            >
              Generate some terms →
            </Link>
          </div>
        )}

        {/* Terms list */}
        {terms.length > 0 && !loading && (
          <section aria-label="Terms bag">
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs font-semibold tracking-[0.1em] uppercase" style={{ color: "var(--foreground-muted)" }}>
                {terms.length} saved
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {terms.map(t => (
                <article
                  key={t._id}
                  className="relative rounded-2xl p-5 transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h2
                        className="font-archivo font-black tracking-[-0.02em] leading-none mb-2"
                        style={{ fontSize: "clamp(1.2rem, 3vw, 1.5rem)", color: "var(--foreground)" }}
                      >
                        {t.term}
                      </h2>
                      <p className="font-grotesk text-xs" style={{ color: "var(--foreground-muted)" }}>
                        {t.situation}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(t)}
                      disabled={deletingId === t._id}
                      aria-label={`Delete ${t.term}`}
                      className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200 cursor-pointer disabled:cursor-default disabled:opacity-40"
                      style={{
                        background: "rgba(255,255,255,0.04)",
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
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M2 3h8M5 3V2h2v1M4 3v6.5a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5V3" />
                      </svg>
                    </button>
                  </div>
                </article>
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

      {showUnlock && <UnlockModal onClose={() => setShowUnlock(false)} />}
    </main>
  );
}
