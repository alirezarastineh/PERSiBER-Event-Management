import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { slug: string[] } }
) {
  // Handle the DevTools JSON request
  if (request.url.includes("com.chrome.devtools.json")) {
    // Return an empty JSON object as it's just a debugging endpoint
    return NextResponse.json({});
  }

  // For any other requests to this path
  return NextResponse.json({}, { status: 404 });
}
