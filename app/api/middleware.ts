import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// List of paths that need API key authentication
const PROTECTED_PATHS = ["/api/influencers"];

export function middleware(request: NextRequest) {
  // Only protect POST requests to specific paths
  if (
    request.method === "POST" &&
    PROTECTED_PATHS.some((path) => request.nextUrl.pathname.startsWith(path))
  ) {
    const apiKey = request.headers.get("x-api-key");

    // Check if API key is present and valid
    if (!apiKey || apiKey !== process.env.API_KEY) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized - Invalid API Key" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  return NextResponse.next();
}
