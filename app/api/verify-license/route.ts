import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import LicenseKey from "@/models/LicenseKey";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request body." }, { status: 400 });
  }

  const { licenseKey } = body as { licenseKey?: string };
  if (!licenseKey || typeof licenseKey !== "string" || licenseKey.trim().length === 0) {
    return NextResponse.json({ success: false, message: "License key is required." }, { status: 400 });
  }

  // Aggressively sanitize — strip all whitespace including newlines (common on mobile paste)
  const key = licenseKey.replace(/\s+/g, "").toUpperCase();

  const productId = process.env.GUMROAD_PRODUCT_ID ?? "";

  if (!productId) {
    console.error("[verify-license] GUMROAD_PRODUCT_ID is not set");
    return NextResponse.json(
      { success: false, message: "Server misconfiguration. Please contact support." },
      { status: 500 }
    );
  }

  try {
    const gumroadRes = await fetch("https://api.gumroad.com/v2/licenses/verify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        product_id: productId,
        license_key: key,
        increment_uses_count: "false",
      }),
    });

    const gumroadData = await gumroadRes.json().catch(() => null);

    console.log("[verify-license] Gumroad status:", gumroadRes.status, "body:", JSON.stringify(gumroadData));

    if (!gumroadRes.ok || !gumroadData?.success) {
      const reason = gumroadData?.message ?? "Invalid license key.";
      return NextResponse.json({ success: false, message: reason });
    }

    // Save to MongoDB if not already stored
    await connectDB();
    const email: string = gumroadData.purchase?.email ?? "";
    await LicenseKey.findOneAndUpdate(
      { licenseKey: key },
      { licenseKey: key, email },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[verify-license] Error:", err);
    return NextResponse.json(
      { success: false, message: "Could not verify license key. Please try again." },
      { status: 500 }
    );
  }
}
