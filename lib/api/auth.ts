import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export interface AuthResult {
  isAuthenticated: boolean;
  token?: string;
  adminId?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AdminJWTPayload {
  adminId: string;
  username: string;
  iat?: number;
  exp?: number;
}

export async function validateAdminToken(
  request: NextRequest
): Promise<AuthResult> {
  const token = request.headers.get("Authorization")?.split("Bearer ")?.[1];

  if (!token) {
    return { isAuthenticated: false };
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AdminJWTPayload;

    // Verify admin still exists and is active
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.adminId },
    });

    if (!admin || admin.status !== "ACTIVE") {
      return { isAuthenticated: false };
    }

    return {
      isAuthenticated: true,
      token,
      adminId: admin.id,
    };
  } catch (error) {
    return { isAuthenticated: false };
  }
}

export async function authenticateAdmin(
  credentials: LoginCredentials
): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const admin = await prisma.admin.findUnique({
      where: { username: credentials.username },
    });

    if (!admin) {
      return { success: false, error: "Invalid credentials" };
    }

    if (admin.status !== "ACTIVE") {
      return { success: false, error: "Account is inactive" };
    }

    const isValidPassword = await bcrypt.compare(
      credentials.password,
      admin.password
    );

    if (!isValidPassword) {
      return { success: false, error: "Invalid credentials" };
    }

    const token = jwt.sign(
      { adminId: admin.id, username: admin.username },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );

    return { success: true, token };
  } catch (error) {
    console.error("Authentication error:", error);
    return { success: false, error: "Authentication failed" };
  }
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
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
