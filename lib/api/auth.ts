import { NextRequest, NextResponse } from "next/server";

export interface AuthResult {
  isAuthenticated: boolean;
  token?: string;
}

export function validateAdminToken(request: NextRequest): AuthResult {
  const token = request.headers.get("Authorization")?.split("Bearer ")?.[1];

  if (!token || token !== process.env.ADMIN_PASSWORD) {
    return { isAuthenticated: false };
  }

  return { isAuthenticated: true, token };
}

export function validateCronToken(request: NextRequest): AuthResult {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return { isAuthenticated: false };
  }

  return { isAuthenticated: true };
}

export function createUnauthorizedResponse(request: NextRequest): NextResponse {
  return NextResponse.redirect(new URL("/", request.url), { status: 302 });
}

export function createAuthErrorResponse(
  message: string = "Unauthorized"
): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 });
}
