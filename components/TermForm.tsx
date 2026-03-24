"use client";

import { useState, useId } from "react";

// Mirror the server-side constants from lib/validate.ts so the client enforces
// the same limits before sending a request. This is UI feedback only —
// the server always re-validates (never trust client-side validation alone).
const SITUATION_MIN_LENGTH = 5;
const SITUATION_MAX_LENGTH = 500;

interface Props {
  onSubmit: (situation: string) => void;
  isLoading: boolean;
}

export default function TermForm({ onSubmit, isLoading }: Props) {
  const [situation, setSituation] = useState("");
  const [focused, setFocused] = useState(false);
  const textareaId = useId();

  const trimmed = situation.trim();
  const charCount = situation.length;
  const nearLimit = charCount >= SITUATION_MAX_LENGTH * 0.85; // warn at 85%
  const atLimit = charCount >= SITUATION_MAX_LENGTH;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trimmed.length >= SITUATION_MIN_LENGTH && !isLoading) onSubmit(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (trimmed.length >= SITUATION_MIN_LENGTH && !isLoading) onSubmit(trimmed);
    }
  };

  const canSubmit =
    trimmed.length >= SITUATION_MIN_LENGTH &&
    trimmed.length <= SITUATION_MAX_LENGTH &&
    !isLoading;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
      {/* Accessible label — visually present but styled as a hint */}
      <label
        htmlFor={textareaId}
        className="font-grotesk text-sm font-medium"
        style={{ color: "var(--foreground-muted)" }}
      >
        Describe the situation
      </label>

      {/* Textarea wrapper with animated border */}
      <div
        className="relative rounded-2xl transition-all duration-300 easing-smooth"
        style={{
          background: "var(--surface)",
          border: `1px solid ${focused ? "rgba(94,106,210,0.5)" : "var(--border)"}`,
          boxShadow: focused ? "0 0 0 3px rgba(94,106,210,0.08), 0 0 28px rgba(94,106,210,0.1)" : "none",
        }}
      >
        <textarea
          id={textareaId}
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="e.g. 'when someone acts totally different around certain people'"
          rows={5}
          maxLength={SITUATION_MAX_LENGTH}
          disabled={isLoading}
          aria-label="Situation description"
          aria-describedby="char-count"
          className="w-full bg-transparent rounded-2xl px-5 py-4 font-grotesk text-base leading-relaxed resize-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ color: "var(--foreground)" }}
        />
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between gap-3">
        <span
          id="char-count"
          className="text-xs tabular-nums"
          style={{ color: atLimit ? "#F87171" : nearLimit ? "#FBBF24" : "rgba(138,143,152,0.6)" }}
          aria-live="polite"
        >
          {charCount > 0
            ? `${charCount} / ${SITUATION_MAX_LENGTH}`
            : <>
                <kbd className="font-grotesk" style={{ fontStyle: "normal" }}>⌘</kbd>
                {" + "}
                <kbd className="font-grotesk">↵</kbd>
                {" to submit"}
              </>
          }
        </span>

        <button
          type="submit"
          disabled={!canSubmit}
          className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-grotesk font-semibold text-sm cursor-pointer transition-all duration-200 easing-smooth disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: canSubmit ? "var(--accent)" : "rgba(94,106,210,0.4)",
            color: "#fff",
            boxShadow: canSubmit ? "0 0 24px rgba(94,106,210,0.3), 0 2px 8px rgba(0,0,0,0.3)" : "none",
          }}
          onMouseEnter={e => {
            if (canSubmit) (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 36px rgba(94,106,210,0.45), 0 2px 12px rgba(0,0,0,0.3)";
          }}
          onMouseLeave={e => {
            if (canSubmit) (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 24px rgba(94,106,210,0.3), 0 2px 8px rgba(0,0,0,0.3)";
          }}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
                <path d="M8 2a6 6 0 0 1 6 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Finding the words...
            </>
          ) : (
            <>
              Generate Terms
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M1 7h12M8 2l5 5-5 5" />
              </svg>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
