import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TermFeedback from "@/models/TermFeedback";

export async function GET() {
  try {
    await connectDB();

    const [likedAgg, dislikedAgg] = await Promise.all([
      TermFeedback.aggregate([
        { $match: { vote: "like" } },
        { $group: { _id: "$term", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      TermFeedback.aggregate([
        { $match: { vote: "dislike" } },
        { $group: { _id: "$term", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    return NextResponse.json({
      liked:    likedAgg.map((d: { _id: string }) => d._id),
      disliked: dislikedAgg.map((d: { _id: string }) => d._id),
    });
  } catch (err) {
    console.error("[feedback/examples] DB error:", err);
    // Return empty arrays so generation still works if DB is unavailable
    return NextResponse.json({ liked: [], disliked: [] });
  }
}
