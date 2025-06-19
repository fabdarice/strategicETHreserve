import { NextResponse } from "next/server";
import { getChartData } from "@/lib/api/snapshots";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/api/error-handling";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const chartResponse = await getChartData();
    return createSuccessResponse(chartResponse);
  } catch (error) {
    return createErrorResponse(error, "Failed to fetch chart data");
  }
}
