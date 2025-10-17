import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ slug?: string[] }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || [];

  // Extract URL from request for potential logging or debugging
  const requestUrl = new URL(request.url);

  // Handle the DevTools JSON request
  if (slug.includes("com.chrome.devtools.json")) {
    // Return an empty JSON object as it's just a debugging endpoint
    return NextResponse.json({
      message: "DevTools endpoint",
      path: requestUrl.pathname,
    });
  }

  // For any other requests to this path
  return NextResponse.json(
    {
      error: "Not found",
      path: requestUrl.pathname,
    },
    { status: 404 },
  );
}
