/**
 * Next.js configuration with OWASP-recommended HTTP security headers.
 *
 * Header references:
 *   OWASP Secure Headers Project: https://owasp.org/www-project-secure-headers/
 *   MDN HTTP Headers: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Apply security headers to every route
        source: "/(.*)",
        headers: [
          // ── Prevent MIME-type sniffing (OWASP A05) ──────────────────────
          // Stops browsers from guessing content type, preventing content
          // sniffing attacks where a file could be executed as a script.
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },

          // ── Prevent clickjacking (OWASP A05) ────────────────────────────
          // Blocks the page from being embedded in an <iframe>, <frame>, or
          // <object> on another origin. Redundant with CSP frame-ancestors
          // but kept for legacy browser support.
          {
            key: "X-Frame-Options",
            value: "DENY",
          },

          // ── Enforce HTTPS (OWASP A02) ────────────────────────────────────
          // Tells browsers to only connect via HTTPS for the next 2 years.
          // includeSubDomains covers all subdomains; preload submits to the
          // HSTS preload list. Only enable preload if you own the domain.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },

          // ── Referrer policy ──────────────────────────────────────────────
          // Sends the full URL to same-origin requests, but only the origin
          // (no path/query) to cross-origin requests. Prevents leaking
          // sensitive URL parameters to third-party services.
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },

          // ── Permissions policy ───────────────────────────────────────────
          // Explicitly disables browser features this app does not need.
          // Reduces the attack surface if a script is ever injected.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation(), interest-cohort=()",
          },

          // ── Content Security Policy (OWASP A03) ─────────────────────────
          // Allowlist-based policy: everything is blocked by default and
          // sources are explicitly permitted.
          //
          // script-src notes:
          //   'unsafe-inline' and 'unsafe-eval' are required by Next.js in
          //   development (hot reload, hydration). In production you should
          //   replace these with a nonce-based CSP via Next.js middleware.
          //   See: https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
          //
          // style-src notes:
          //   'unsafe-inline' is required for Tailwind's runtime styles and
          //   Google Fonts' stylesheet injection.
          //
          // font-src notes:
          //   fonts.gstatic.com serves the actual font files loaded by the
          //   Google Fonts CSS (fonts.googleapis.com).
          {
            key: "Content-Security-Policy",
            value: [
              // Block everything not explicitly allowed
              "default-src 'self'",
              // Next.js requires unsafe-inline + unsafe-eval in dev mode
              // TODO: Switch to nonce-based CSP for production builds
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              // Tailwind CSS + Google Fonts stylesheets
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Google Fonts font files
              "font-src 'self' https://fonts.gstatic.com",
              // API calls go to same origin only (no third-party fetches from browser)
              "connect-src 'self'",
              // Inline SVGs encoded as data: URIs (used in components)
              "img-src 'self' data:",
              // Block all framing (defense-in-depth with X-Frame-Options)
              "frame-ancestors 'none'",
              // No plugins (Flash, etc.)
              "object-src 'none'",
              // Disallow form submissions to external URLs
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
