import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    return NextResponse.json({ totalReserve });
  } catch (error) {
    console.error("Error fetching total reserve:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
