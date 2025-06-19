import { NextRequest } from "next/server";
import { getCompanyReserveData } from "@/lib/api/snapshots";
import {
  createErrorResponse,
  createSuccessResponse,
  createValidationErrorResponse,
} from "@/lib/api/error-handling";

export async function GET(request: NextRequest) {
  try {
    // Get companyId from query parameters
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return createValidationErrorResponse("Company ID is required");
    }

    const reserveData = await getCompanyReserveData(companyId);
    return createSuccessResponse(reserveData);
  } catch (error) {
    return createErrorResponse(error, "Failed to fetch reserve data");
  }
}
