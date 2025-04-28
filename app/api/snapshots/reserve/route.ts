import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // Get companyId from query parameters
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json(
        { error: "Company ID is required" },
        { status: 400 }
      );
    }

    // Get the last two snapshots for this company ordered by date
    const companySnapshots = await prisma.snapshotCompany.findMany({
      where: {
        companyId: companyId,
      },
      orderBy: {
        snapshotDate: "desc",
      },
      select: {
        reserve: true,
        snapshotDate: true,
      },
      take: 2,
    });

    if (companySnapshots.length === 0) {
      return NextResponse.json({
        totalReserve: 0,
        previousReserve: 0,
      });
    }

    // Current (latest) snapshot
    const totalReserve = companySnapshots[0]?.reserve || 0;

    // Previous snapshot if available
    const previousReserve =
      companySnapshots.length > 1 ? companySnapshots[1]?.reserve || 0 : 0;

    return NextResponse.json({
      totalReserve,
      previousReserve,
    });
  } catch (error) {
    console.error("Error fetching reserve data:", error);
    return NextResponse.json(
      { error: "Failed to fetch reserve data" },
      { status: 500 }
    );
  }
}
