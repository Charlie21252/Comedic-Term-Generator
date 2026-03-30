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

  const key = licenseKey.trim();

  try {
    const gumroadRes = await fetch("https://api.gumroad.com/v2/licenses/verify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        product_id: process.env.GUMROAD_PRODUCT_ID ?? "",
        license_key: key,
        increment_uses_count: "false",
      }),
    });

    // Gumroad returns 404 for invalid keys, 200 for valid
    if (!gumroadRes.ok) {
      return NextResponse.json({ success: false, message: "Invalid license key." });
    }

    const gumroadData = await gumroadRes.json();

    if (!gumroadData.success) {
      return NextResponse.json({ success: false, message: "Invalid license key." });
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
