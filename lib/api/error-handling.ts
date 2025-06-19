import { NextResponse } from "next/server";

export interface APIError {
  message: string;
  status: number;
}

export function createErrorResponse(
  error: unknown,
  defaultMessage: string = "Internal server error"
): NextResponse {
  console.error(defaultMessage, error);

  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ error: defaultMessage }, { status: 500 });
}

export function createValidationErrorResponse(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function createNotFoundResponse(resource: string): NextResponse {
  return NextResponse.json({ error: `${resource} not found` }, { status: 404 });
}

export function createSuccessResponse(
  data: any,
  status: number = 200
): NextResponse {
  return NextResponse.json(data, { status });
}
