/**
 * POST /api/generate-term
 *
 * Security layers (applied in order):
 *   1. API key presence check   — fail fast at module load if key is missing
 *   2. Rate limiting            — 10 req / IP / 60 s (sliding window)
 *   3. JSON parse guard         — malformed bodies return 400, not 500
 *   4. Input validation         — allowlist fields, type + length checks
 *   5. Input sanitization       — control characters stripped before AI use
 *   6. Error information hiding — raw errors logged server-side only; clients
 *                                 receive generic messages (OWASP A09)
 *
 * API key handling (OWASP A02):
 *   - Key is stored in .env.local (server-side only, never committed to git)
 *   - No NEXT_PUBLIC_ prefix → key is never included in the browser bundle
 *   - Anthropic SDK reads process.env.ANTHROPIC_API_KEY automatically
 *   - Key is never returned in any response body or header
 *   - Rotate the key at: https://console.anthropic.com/settings/keys
 */

import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { validateBody } from "@/lib/validate";

// ─── Lazy Client ─────────────────────────────────────────────────────────────
// The Anthropic client is created on first request, not at module load time.
// Reason: Next.js evaluates route modules during `next build` to collect page
// data. At that point Vercel environment variables are not yet injected, so a
// module-level key check would throw and fail the build even though the key
// is correctly configured in Vercel's dashboard.
//
// The key is read from process.env.ANTHROPIC_API_KEY (set in .env.local for
// local dev, or in Vercel → Project Settings → Environment Variables for
// production). It has no NEXT_PUBLIC_ prefix so it is never sent to the browser.
let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    // This runs at request time, not build time — safe to throw here.
    throw new Error(
      "[generate-term] ANTHROPIC_API_KEY is not set. " +
      "Add it to .env.local (local) or Vercel Environment Variables (production). " +
      "Never expose this key client-side or commit it to version control."
    );
  }
  if (!_client) {
    _client = new Anthropic();
  }
  return _client;
}

// ─── System Prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a cultural linguist and comedy writer who specializes in naming things that don't have names yet — or finding the perfect existing term for a situation. You have a deep knowledge of slang, internet culture, Gen Z language, psychology, philosophy, sports, chess, music, and everyday human behavior. Your terms are sharp, memorable, and feel instantly correct when you hear them.

When given a situation or behavior, generate exactly 5 terms for it. Each term should come from a different world (e.g., one from sports, one from chess/strategy, one from psychology, one from internet/Gen Z culture, one that feels like it could be its own coined phrase).

Rules:
- Terms must feel satisfying and clever, like "oh that's exactly what that is"
- Definitions are punchy — one sentence max, no fluff
- Example sentences should sound like something a real person would actually say
- Mix well-known terms with freshly coined ones
- Draw freely from Gen Z and internet slang when it fits — terms like "chud" (a repulsive, amateurish, or chronically underachieving person), "[x]-maxxing" (taking something to its absolute extreme, e.g. gymmaxxing, looksmaxxing, douchebag-maxxing), and similar modern vocabulary are valid and encouraged or rage-bait online or real life something deliberately designed to provoke anger, frustration, or outrage, to get a reaction from a freind or community on the internet also [x]-farming (compliment-farming, aura farming, rage-bait farming, etc.) is also valid and encouraged when it fits the situation
- Never be corny or try-hard
- avoid saying benchwarming/benchwarmer, ghosting, or any other overused term that doesn't feel fresh and specific to the situation
- Use sports and sports freindly terms such as ball knower (someone who is very knowledgeable about a particular topic, often more than the average person) or clubhouse guy (someone who is well-liked and influential within a particular social group, often without doing much themselves), glue guy (someone who may not be the star but is essential to keeping a group together and functioning), or similar when it fits, or feel free to put a new spin on sports metaphors to create fresh terms
- use videogame terms like ads (aim down sights), nerf, buff, or similar when it fits, or cosmetics (stuff only for looks doesnt help gameplay), or grey loot (stuff that isnt as good as other stuff or subpar), ground loot (a weapon found on the ground that has no attachments on it so its just vanilla or basemodel or boaring) or put a new spin on gaming metaphors to create fresh terms use mainly fortnite, call of duty warzone, call of duty modern warfare, or similar popular shooters as reference points for gaming metaphors since they are widely known and have a lot of established slang that can be repurposed for everyday situations, or nba 2k terms such as takeover (when a player gets on a hot streak and becomes much more likely to succeed), or similar popular sports games with widely known slang that can be repurposed for everyday situations

Example anchors (the quality and vibe to aim for):

{
  "term": "North Star",
  "definition": "The one goal someone is so locked in on that everything else becomes background noise.",
  "example": "Yeah he turned down the offer — that startup is his North Star right now."
}

{
  "term": "Dog Whistle",
  "definition": "A reference, joke, or signal that only certain people will catch — invisible to everyone else.",
  "example": "Half the room had no idea, but that line was a total dog whistle for anyone who was there."
}

{
  "term": "Checkmate",
  "definition": "When you say something just sharp enough that the other person has nowhere left to go.",
  "example": "She came back with one sentence and that was it — checkmate, conversation over."
}

Return JSON only, no extra text:

{
  "terms": [
    {
      "term": "North Star",
      "definition": "The one goal someone is so locked in on that everything else becomes background noise.",
      "example": "Yeah he turned down the offer — that startup is his North Star right now."
    }
  ]
}`;

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {

  // ── 1. Rate Limiting ───────────────────────────────────────────────────────
  // Extract client IP from proxy headers (x-forwarded-for is set by Vercel,
  // Cloudflare, and most reverse proxies). Fall back to x-real-ip, then a
  // sentinel string so the limiter still works in environments without headers.
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const rateLimit = checkRateLimit(ip);

  // Standard rate-limit response headers
  // (aligned with IETF draft-ietf-httpapi-ratelimit-headers-06)
  const rateLimitHeaders: Record<string, string> = {
    "X-RateLimit-Limit": "10",
    "X-RateLimit-Remaining": String(rateLimit.remaining),
    "X-RateLimit-Reset": String(rateLimit.resetInSeconds),
  };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment before trying again." },
      {
        status: 429,
        headers: {
          ...rateLimitHeaders,
          // Retry-After tells clients how long to back off (RFC 6585 §4)
          "Retry-After": String(rateLimit.resetInSeconds),
        },
      }
    );
  }

  // ── 2. Parse JSON Body ─────────────────────────────────────────────────────
  // Catch malformed JSON separately so it returns a 400, not a 500.
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400, headers: rateLimitHeaders }
    );
  }

  // ── 3. Validate + Sanitize Input ───────────────────────────────────────────
  const validation = validateBody(body);
  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.error },
      { status: validation.status, headers: rateLimitHeaders }
    );
  }

  // ── 4. Call Anthropic API ──────────────────────────────────────────────────
  // `validation.situation` is trimmed, sanitized, and within length limits.
  // The API key is server-side only — it is never included in the response.
  try {
    const message = await getClient().messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: validation.situation }],
    });

    const content = message.content[0];

    if (content.type !== "text") {
      // Log the unexpected type internally but don't expose Anthropic internals
      console.error("[generate-term] Unexpected Anthropic content type:", content.type);
      return NextResponse.json(
        { error: "Unexpected response from AI. Please try again." },
        { status: 502, headers: rateLimitHeaders }
      );
    }

    // Extract JSON object from response — handles code fences, preamble text, etc.
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    const raw = jsonMatch ? jsonMatch[0].trim() : content.text.trim();

    // Parse AI response — malformed JSON is a 502 (upstream error), not a 500
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.error("[generate-term] Failed to parse AI JSON response");
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 502, headers: rateLimitHeaders }
      );
    }

    return NextResponse.json(parsed, { headers: rateLimitHeaders });

  } catch (err) {
    // Log the full error server-side for debugging.
    // Return only a generic message to the client — raw error objects can
    // contain API keys, stack traces, or internal service details (OWASP A09).
    console.error("[generate-term] Anthropic API error:", err);
    return NextResponse.json(
      { error: "Failed to generate terms. Please try again." },
      { status: 500, headers: rateLimitHeaders }
    );
  }
}
