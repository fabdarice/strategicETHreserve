import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { validateAdminToken, createUnauthorizedResponse } from "@/lib/api/auth";
import {
  createErrorResponse,
  createSuccessResponse,
  createValidationErrorResponse,
} from "@/lib/api/error-handling";

const InfluencerSchema = z.object({
  name: z.string().min(1),
  avatar: z.string().url().optional(),
  description: z.string().min(1),
  commitment: z.string().min(1),
  twitter: z.string().optional(),
});

export async function GET() {
  try {
    const influencers = await prisma.influencer.findMany({
      orderBy: {
        createdAt: "asc",
      },
    });

    return createSuccessResponse(influencers);
  } catch (error) {
    return createErrorResponse(error, "Failed to fetch influencers");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { isAuthenticated } = await validateAdminToken(request);

    if (!isAuthenticated) {
      return createUnauthorizedResponse(request);
    }

    const body = await request.json();
    const validatedData = InfluencerSchema.parse(body);

    const influencer = await prisma.influencer.create({
      data: validatedData,
    });

    return createSuccessResponse(influencer, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createValidationErrorResponse(
        error.errors.map((e) => e.message).join(", ")
      );
    }
    return createErrorResponse(error, "Failed to create influencer");
  }
}
