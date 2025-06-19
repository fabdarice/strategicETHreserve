import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/api/error-handling";

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      select: {
        currentReserve: true,
      },
      where: {
        status: "ACTIVE",
      },
    });

    const totalReserve = companies.reduce(
      (sum, company) => sum + company.currentReserve,
      0
    );

    return createSuccessResponse({ totalReserve });
  } catch (error) {
    return createErrorResponse(error, "Error fetching total reserve");
  }
}
