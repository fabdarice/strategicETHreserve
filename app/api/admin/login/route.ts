import { NextRequest, NextResponse } from "next/server";
import { authenticateAdmin, LoginCredentials } from "@/lib/api/auth";
import {
  createErrorResponse,
  createSuccessResponse,
  createValidationErrorResponse,
} from "@/lib/api/error-handling";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password }: LoginCredentials = body;

    // Validate input
    if (!username || !password) {
      return createValidationErrorResponse(
        "Username and password are required"
      );
    }

    // Authenticate admin
    const result = await authenticateAdmin({ username, password });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Authentication failed" },
        { status: 401 }
      );
    }

    return createSuccessResponse({
      success: true,
      token: result.token,
      message: "Authentication successful",
    });
  } catch (error: any) {
    console.error("Login API error:", error);
    return createErrorResponse(
      error,
      "Internal server error during authentication"
    );
  }
}
