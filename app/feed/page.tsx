"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface FeedTerm {
  _id: string;
  term: string;
  situation: string;
  savedAt: string;
}

function formatRelativeTime(dateStr: string): string {
  const diffSec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  const diffWeek = Math.floor(diffDay / 7);
  if (diffWeek < 4) return `${diffWeek}w ago`;
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth}mo ago`;
  return `${Math.floor(diffDay / 365)}y ago`;
}

const NAV_LINK_STYLE = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "var(--foreground-muted)",
};

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-grotesk font-medium tracking-[0.04em] transition-all duration-200"
      style={NAV_LINK_STYLE}
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
      {icon}
      {label}
    </Link>
  );
}

export default function FeedPage() {
  const [terms, setTerms] = useState<FeedTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchPage = useCallback(async (before?: string) => {
    const url = before
      ? `/api/library/global?before=${encodeURIComponent(before)}`
      : "/api/library/global";
    const res = await fetch(url);
    if (!res.ok) throw new Error("request failed");
    return res.json() as Promise<{ terms: FeedTerm[]; hasMore: boolean }>;
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchPage();
        setTerms(data.terms ?? []);
        setHasMore(data.hasMore ?? false);
      } catch {
        setError("Could not load the feed. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchPage]);

  const loadMore = async () => {
    if (terms.length === 0 || loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await fetchPage(terms[terms.length - 1].savedAt);
      setTerms(prev => [...prev, ...(data.terms ?? [])]);
      setHasMore(data.hasMore ?? false);
    } catch {
      setError("Could not load more terms. Please try again.");
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <main className="min-h-dvh">
      {/* Ambient blobs */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[700px] h-[480px] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(ellipse, #FF6B4A 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-[-160px] right-[-120px] w-[520px] h-[420px] rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(ellipse, #EC4899 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative max-w-[680px] mx-auto px-5 pt-[72px] pb-28">
        {/* Header */}
        <header className="mb-12">
          <h1 className="font-archivo leading-[0.95] tracking-[-0.03em] mb-6">
            <span className="block text-[52px] sm:text-[68px] font-[300]" style={{ color: "var(--foreground-muted)" }}>
              Global
            </span>
            <span className="block text-[52px] sm:text-[68px] font-[900]" style={{ color: "var(--foreground)" }}>
              Feed
            </span>
          </h1>

          {/* Nav links */}
          <nav className="flex items-center gap-2 flex-wrap" aria-label="Site navigation">
            <NavLink
              href="/"
              label="Generator"
              icon={
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M1 6l5-5 5 5" />
                  <path d="M2 5.5V11h3V8h2v3h3V5.5" />
                </svg>
              }
            />
            <NavLink
              href="/examples"
              label="Examples"
              icon={
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="1" y="1" width="4" height="4" rx="0.8" />
                  <rect x="7" y="1" width="4" height="4" rx="0.8" />
                  <rect x="1" y="7" width="4" height="4" rx="0.8" />
                  <rect x="7" y="7" width="4" height="4" rx="0.8" />
                </svg>
              }
            />
            <NavLink
              href="/library"
              label="Library"
              icon={
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2 1.5h8a.5.5 0 0 1 .5.5v8l-4-2-4 2V2a.5.5 0 0 1 .5-.5z" />
                </svg>
              }
            />
          </nav>
        </header>

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
        {!loading && !error && terms.length === 0 && (
          <div className="text-center py-16">
            <p className="text-base mb-4" style={{ color: "var(--foreground-muted)" }}>
              No shared terms yet — be the first to share one!
            </p>
            <Link
              href="/"
              className="text-sm font-medium transition-colors duration-200"
              style={{ color: "#FFB199" }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--foreground)")}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = "#FFB199")}
            >
              Generate some terms →
            </Link>
          </div>
        )}

        {/* Feed list */}
        {terms.length > 0 && !loading && (
          <section aria-label="Recently shared terms">
            <div className="flex flex-col gap-3">
              {terms.map(t => (
                <article
                  key={t._id}
                  className="relative rounded-2xl p-5"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h2
                      className="font-archivo font-black tracking-[-0.02em] leading-none"
                      style={{ fontSize: "clamp(1.2rem, 3vw, 1.5rem)", color: "var(--foreground)" }}
                    >
                      {t.term}
                    </h2>
                    <span className="shrink-0 text-xs font-grotesk" style={{ color: "var(--foreground-muted)" }}>
                      {formatRelativeTime(t.savedAt)}
                    </span>
                  </div>
                  <p className="font-grotesk text-xs leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
                    {t.situation}
                  </p>
                </article>
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-5 py-2.5 rounded-xl font-grotesk font-medium text-sm cursor-pointer transition-all duration-200 disabled:cursor-default disabled:opacity-50"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground-muted)",
                  }}
                  onMouseEnter={e => {
                    if (!loadingMore) (e.currentTarget as HTMLButtonElement).style.color = "var(--foreground)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--foreground-muted)";
                  }}
                >
                  {loadingMore ? "Loading..." : "Load more"}
                </button>
              </div>
            )}
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="pb-8 text-center">
        <span className="text-xs" style={{ color: "rgba(138,143,152,0.35)" }}>
          comedicterm.com
        </span>
      </footer>
    </main>
  );
}
