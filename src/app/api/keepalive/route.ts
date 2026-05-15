import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const HEADERS = {
  "Content-Type": "text/plain",
  "Cache-Control": "no-store, no-cache, must-revalidate",
  "Pragma": "no-cache",
};

// Endpoint for external cron services (e.g. cron-job.org) to keep the
// Render free-tier dyno awake. Always hits the server, returns 2 bytes.
export async function GET() {
  return new NextResponse("ok", { status: 200, headers: HEADERS });
}

export async function HEAD() {
  return new NextResponse(null, { status: 200, headers: HEADERS });
}
