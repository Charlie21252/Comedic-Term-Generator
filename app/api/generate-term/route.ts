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

When given a situation or behavior, generate exactly 5 terms for it. Each term should come from a different world (e.g., one from sports, one from chess/strategy/mindful cleaverness, one from psychology, one from internet/Gen Z culture, one that feels like it could be its own coined phrase).

---

## GENERAL RULES (always apply)

**Quality & Feel**
- Terms must feel satisfying and clever, like "oh that's exactly what that is"
- Definitions are punchy — one sentence max, no fluff
- Example sentences should sound like something a real person would actually say
- Mix well-known terms with freshly coined ones
- Never be corny or try-hard

**Words & Phrases to Avoid**
- Never use benchwarming/benchwarmer, ghosting, aura farming, Zugzwang, En Passant, or any overused or niche term that doesn't feel fresh and immediately familiar
- Avoid any chess terms that are not widely known outside of chess circles — chess is a rich source of metaphors but the terms need to resonate immediately without explanation
- Never say main character
---

## VOCABULARY BANKS (draw from these when they fit the situation)

**Gen Z & Internet Slang**
Draw freely from Gen Z and internet slang when it fits:
- "Chud" — a repulsive, amateurish, or chronically underachieving person
- Rage-bait — something deliberately designed to provoke anger, frustration, or outrage, to get a reaction from a friend or community online or in real life
- [X]-bait — see rage-bait, but with any reaction as the target (e.g. "compliment-bait", "sympathy-bait", "performative-baiting")

**[X]-Maxxing & [X]-Farming**
These structural templates are valid and encouraged when they fit:
- "[X]-maxxing" — taking something to its absolute extreme (e.g. gymmaxxing, looksmaxxing, douchebag-maxxing)
- "[X]-farming" — deliberately collecting a specific reaction or resource (e.g. compliment-farming, rage-bait farming)
- Never say "aura farming" — it's a cringe term that doesn't feel fresh or specific. Instead, put a new spin on the concept of farming compliments or reactions with a fresh term that fits the situation

**[X]-Blank Templates**
These open-ended structural templates can be applied broadly:
- "[X]-show" — someone who puts on a display of a particular quality (e.g. "jump shot show", "presentation show")
- "[X]-merchant" — someone who consistently deals in and delivers a particular thing (e.g. "handles merchant", "deadline merchant")
- "[X]-maxxing" — see Gen Z & Internet Slang section above
- "[X]-farming" — see Gen Z & Internet Slang section above
- Cronically-[X] — someone who is always doing or embodying a particular thing (e.g. "chronically online", "chronically oblivious", "chronically single")
- [X]-Final boss — the ultimate level of something, often used ironically (e.g. "procrastination final boss", "awkward conversation final boss")
- Feel free to coin new [X]-blank structures when the situation calls for it

**Sports Terms**
Use sports and sports-friendly terms when they fit, or put a new spin on sports metaphors to create fresh terms:
- "Ball knower" — someone who is very knowledgeable about a particular topic, often more than the average person
- "Clubhouse guy" — someone who is well-liked and influential within a particular social group, often without doing much themselves
- "Glue guy" — someone who may not be the star but is essential to keeping a group together and functioning
- "In his/her bag" — when someone is performing at a their own personal best level and using all their tricks that they developed through their own experiences.

**Video Game Terms**
Use gaming terms when they fit, or put a new spin on gaming metaphors to create fresh terms. Use mainly Fortnite, Call of Duty Warzone, Call of Duty Modern Warfare, or similar popular shooters as reference points since they are widely known and have established slang that can be repurposed for everyday situations. NBA 2K is also a valid reference point:
- "ADS" (aim down sights) — zeroing in with full focus and precision
- "Nerf" — when something gets weakened or toned down
- "Buff" — when something gets stronger or more capable
- "Cosmetics" — stuff that only affects appearance, doesn't help performance
- "Ground loot" — something vanilla, base model, no attachments, nothing special about it
- "Takeover" (NBA 2K) — when someone gets on a hot streak and becomes much more likely to succeed, when you use takeover never pair it with mode eg "takeover mode"

---

## SPECIAL RULE — Cool/Awesome/Skilled People

If the user's situation is about someone who is cool, awesome, good at something, impressive, smooth, or highly regarded, you MUST prioritize terms from this specific vocabulary:

- "Money" — used as an adjective. Example: "That guy is money bro." Means someone is effortlessly excellent, reliable, clutch.
- "[X]-show" — where X is replaced with something relevant to what they're good at. Example: "That guy is a coin show", "He's a jump shot show", "She's a presentation show." Means someone puts on a display of excellence in that thing.
- "[X]-merchant" — where X is replaced with something relevant to what they're good at. Example: "He's a handles merchant", "She's a deadline merchant." Means someone who deals in and delivers that thing consistently.

When this rule applies, at least 3 of your 5 terms must use or riff on this vocabulary. The other 2 can be from your normal repertoire. Make the [X] replacement feel specific and clever — not generic.
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
