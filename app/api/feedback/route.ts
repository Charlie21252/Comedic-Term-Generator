import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TermFeedback from "@/models/TermFeedback";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const { term, situation, vote } = body as Record<string, unknown>;

  if (typeof term !== "string" || !term.trim()) {
    return NextResponse.json({ error: "term is required." }, { status: 400 });
  }
  if (typeof situation !== "string" || !situation.trim()) {
    return NextResponse.json({ error: "situation is required." }, { status: 400 });
  }
  if (vote !== "like" && vote !== "dislike") {
    return NextResponse.json({ error: "vote must be 'like' or 'dislike'." }, { status: 400 });
  }

  try {
    await connectDB();
    await TermFeedback.create({ term: term.trim(), situation: situation.trim(), vote });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[feedback] DB error:", err);
    return NextResponse.json({ error: "Failed to save feedback." }, { status: 500 });
  }
}
