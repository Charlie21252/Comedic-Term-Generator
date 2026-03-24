/**
 * OWASP-aligned in-memory rate limiter using a sliding window counter.
 *
 * PRODUCTION NOTE: This Map-based store lives in a single Node.js process.
 * For multi-instance / serverless deployments (e.g. Vercel Edge, multiple
 * containers) replace this with a shared store such as:
 *   - @upstash/ratelimit + Redis (recommended for Vercel)
 *   - ioredis with Lua INCR scripts
 *   - Cloudflare Workers KV
 *
 * Defaults (adjust to suit your traffic):
 *   WINDOW_MS   = 60 000ms  (1 minute)
 *   MAX_REQUESTS = 10        (requests per IP per window)
 */

interface RateLimitEntry {
  count: number;
  windowStart: number; // epoch ms
}

// ─── Constants ───────────────────────────────────────────────────────────────

/** Sliding window duration in milliseconds */
const WINDOW_MS = 60_000;

/** Maximum requests allowed per IP per window */
const MAX_REQUESTS = 10;

/** How often to purge expired entries (prevents unbounded memory growth) */
const CLEANUP_INTERVAL_MS = 5 * 60_000;

// ─── Store ───────────────────────────────────────────────────────────────────

const store = new Map<string, RateLimitEntry>();

// Periodic cleanup — remove entries whose window has expired
setInterval(() => {
  const now = Date.now();
  store.forEach((entry, key) => {
    if (now - entry.windowStart > WINDOW_MS) {
      store.delete(key);
    }
  });
}, CLEANUP_INTERVAL_MS).unref(); // .unref() so this timer doesn't keep the process alive

// ─── Public API ──────────────────────────────────────────────────────────────

export interface RateLimitResult {
  /** Whether the request is within the allowed limit */
  allowed: boolean;
  /** Requests remaining in the current window */
  remaining: number;
  /** Seconds until the current window resets */
  resetInSeconds: number;
}

/**
 * Check and increment the rate limit counter for the given IP.
 *
 * Call this at the top of every public API route handler before
 * doing any work. Return a 429 immediately if `allowed` is false.
 *
 * @param ip - Client IP address (use x-forwarded-for → x-real-ip fallback)
 */
export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const entry = store.get(ip);

  // No existing entry, or the previous window has expired → start a new window
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    store.set(ip, { count: 1, windowStart: now });
    return {
      allowed: true,
      remaining: MAX_REQUESTS - 1,
      resetInSeconds: Math.ceil(WINDOW_MS / 1000),
    };
  }

  const resetInSeconds = Math.ceil((WINDOW_MS - (now - entry.windowStart)) / 1000);

  // Window is active and limit has been reached
  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetInSeconds };
  }

  // Within limit — increment and allow
  entry.count += 1;
  return {
    allowed: true,
    remaining: MAX_REQUESTS - entry.count,
    resetInSeconds,
  };
}
