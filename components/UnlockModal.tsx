"use client";

import { useState } from "react";

export default function UnlockModal({ onClose }: { onClose: () => void }) {
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gumroadUrl = process.env.NEXT_PUBLIC_GUMROAD_PRODUCT_URL ?? "#";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/verify-license", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseKey: key.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("licenseKey", key.trim());
        window.location.reload();
      } else {
        setError("Invalid or already used license key.");
      }
    } catch {
      setError("Could not verify key. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

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
        <h2
          className="font-archivo font-black text-2xl tracking-tight mb-2"
          style={{ color: "var(--foreground)" }}
        >
          Enter your license key
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--foreground-muted)" }}>
          Paste the key from your Gumroad receipt to unlock unlimited generations and your personal library.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            value={key}
            onChange={e => setKey(e.target.value)}
            placeholder="XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX"
            className="w-full rounded-xl px-4 py-3 text-sm font-grotesk outline-none transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "var(--foreground)",
            }}
            onFocus={e => (e.currentTarget.style.borderColor = "rgba(94,106,210,0.6)")}
            onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
            autoFocus
          />

          {error && (
            <p className="text-xs px-1" style={{ color: "#F87171" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !key.trim()}
            className="w-full py-3 rounded-xl font-grotesk font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            style={{ background: "#5E6AD2", color: "#fff" }}
          >
            {loading ? "Verifying..." : "Unlock Access"}
          </button>
        </form>

        <div className="flex items-center justify-between mt-5">
          <a
            href={gumroadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs transition-colors duration-200"
            style={{ color: "var(--foreground-muted)" }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = "#9BA3F5")}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--foreground-muted)")}
          >
            Get your key here →
          </a>
          <button
            onClick={onClose}
            className="text-xs transition-colors duration-200 cursor-pointer"
            style={{ color: "var(--foreground-muted)" }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "var(--foreground)")}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "var(--foreground-muted)")}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
