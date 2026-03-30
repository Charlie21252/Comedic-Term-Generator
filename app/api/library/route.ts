import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import LicenseKey from "@/models/LicenseKey";
import SavedTerm from "@/models/SavedTerm";

async function isValidLicense(key: string): Promise<boolean> {
  await connectDB();
  const found = await LicenseKey.findOne({ licenseKey: key });
  return !!found;
}

// GET /api/library?licenseKey=xxx
export async function GET(req: NextRequest) {
  const licenseKey = req.nextUrl.searchParams.get("licenseKey") ?? "";
  if (!licenseKey) {
    return NextResponse.json({ error: "licenseKey is required." }, { status: 400 });
  }

  if (!(await isValidLicense(licenseKey))) {
    return NextResponse.json({ error: "Invalid license key." }, { status: 403 });
  }

  const terms = await SavedTerm.find({ licenseKey }).sort({ savedAt: -1 });
  return NextResponse.json({ terms });
}

// POST /api/library/save — handled via /api/library route with sub-path check
// We use a separate file for /api/library/save, but here we handle POST on /api/library too
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { licenseKey, term, situation } = body as {
    licenseKey?: string;
    term?: string;
    situation?: string;
  };

  if (!licenseKey || !term || !situation) {
    return NextResponse.json({ error: "licenseKey, term, and situation are required." }, { status: 400 });
  }

  if (!(await isValidLicense(licenseKey))) {
    return NextResponse.json({ error: "Invalid license key." }, { status: 403 });
  }

  await SavedTerm.create({ licenseKey, term, situation });
  return NextResponse.json({ success: true });
}

// DELETE /api/library?licenseKey=xxx&term=xxx
export async function DELETE(req: NextRequest) {
  const licenseKey = req.nextUrl.searchParams.get("licenseKey") ?? "";
  const term = req.nextUrl.searchParams.get("term") ?? "";

  if (!licenseKey || !term) {
    return NextResponse.json({ error: "licenseKey and term are required." }, { status: 400 });
  }

  if (!(await isValidLicense(licenseKey))) {
    return NextResponse.json({ error: "Invalid license key." }, { status: 403 });
  }

  await SavedTerm.findOneAndDelete({ licenseKey, term });
  return NextResponse.json({ success: true });
}
