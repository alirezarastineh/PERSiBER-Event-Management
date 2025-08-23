import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug?: string[] }> }
) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || [];

  // Handle the DevTools JSON request
  if (slug.includes("com.chrome.devtools.json")) {
    // Return an empty JSON object as it's just a debugging endpoint
    return NextResponse.json({});
  }

  // For any other requests to this path
  return NextResponse.json({}, { status: 404 });
}
