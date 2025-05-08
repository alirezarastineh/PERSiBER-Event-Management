import { NextResponse } from "next/server";

export async function GET() {
  // Return an empty JSON object to satisfy the Chrome DevTools request
  return NextResponse.json({});
}
