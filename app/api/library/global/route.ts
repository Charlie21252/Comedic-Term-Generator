import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { connectDB } from "@/lib/mongodb";
import SavedTerm from "@/models/SavedTerm";

const PAGE_SIZE = 25;

// GET /api/library/global?before=<ISO8601>
// Public feed of terms users have opted to share. No license required.
export async function GET(req: NextRequest) {
  // Extract client IP from proxy headers (x-forwarded-for is set by Vercel,
  // Cloudflare, and most reverse proxies). Fall back to x-real-ip, then a
  // sentinel string so the limiter still works in environments without headers.
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const rateLimit = checkRateLimit(ip);

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
          "Retry-After": String(rateLimit.resetInSeconds),
        },
      }
    );
  }

  await connectDB();

  const before = req.nextUrl.searchParams.get("before");
  const filter: Record<string, unknown> = { shared: true };
  if (before) {
    const beforeDate = new Date(before);
    if (!isNaN(beforeDate.getTime())) {
      filter.savedAt = { $lt: beforeDate };
    }
  }

  const docs = await SavedTerm.find(filter)
    .sort({ savedAt: -1 })
    .limit(PAGE_SIZE + 1)
    .select("term situation savedAt");

  const hasMore = docs.length > PAGE_SIZE;
  const terms = docs.slice(0, PAGE_SIZE);

  return NextResponse.json({ terms, hasMore }, { headers: rateLimitHeaders });
}
