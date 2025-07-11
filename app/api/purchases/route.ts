import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createErrorResponse,
  createSuccessResponse,
  createValidationErrorResponse,
} from "@/lib/api/error-handling";
import { validateAdminToken, createAuthErrorResponse } from "@/lib/api/auth";
import { AccountingType, CompanyStatus } from "@/app/interfaces/interface";
import { getETHPrice } from "@/lib/web3";
import { fetchCompanyInfo, CompanyInfo } from "@/lib/companyinfo";
import { createSnapshotDate } from "@/lib/api/snapshots";

// Helper function to update company snapshot
async function updateCompanySnapshot(companyId: string) {
  try {
    const snapshotDate = createSnapshotDate();

    // Get updated company data
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        ticker: true,
        marketCapTracking: true,
        currentReserve: true,
        accountingType: true,
        status: true,
      },
    });

    if (!company) {
      console.error(`Company ${companyId} not found for snapshot update`);
      return;
    }

    // Get company wallet balances if using wallet tracking
    const companyWalletBalances = await prisma.companyWallet.groupBy({
      by: ["companyId"],
      _sum: { balance: true },
      where: { companyId },
    });

    const walletBalance = companyWalletBalances[0]?._sum?.balance ?? 0;

    // Determine current reserve based on accounting type
    const currentReserve =
      company.accountingType === AccountingType.WALLET_TRACKING
        ? walletBalance
        : company.currentReserve;

    // Fetch company info if eligible for market data
    let companyInfo: CompanyInfo = { marketCap: null, sharesOutstanding: null };
    if (
      company.status === CompanyStatus.ACTIVE &&
      company.ticker &&
      company.marketCapTracking === "Public Listing"
    ) {
      try {
        companyInfo = await fetchCompanyInfo(company.ticker);
      } catch (error) {
        console.error(
          `Failed to fetch company info for ${company.name}:`,
          error
        );
      }
    }

    // Calculate total cost accumulated from purchases
    const purchasesSum = await prisma.purchase.aggregate({
      where: { companyId },
      _sum: { totalCost: true },
    });
    const totalCostAccumulated = purchasesSum._sum.totalCost ?? 0;

    // Find most recent previous company snapshot
    const prevCompanySnapshot = await prisma.snapshotCompany.findFirst({
      where: {
        companyId,
        snapshotDate: { lt: snapshotDate },
      },
      orderBy: { snapshotDate: "desc" },
    });

    const prevReserve =
      prevCompanySnapshot?.reserve ?? company.currentReserve ?? 0;
    const diff = (currentReserve || 0) - prevReserve;
    const pctDiff =
      prevReserve > 0
        ? Math.round((diff / prevReserve) * 100 * 100) / 100
        : null;

    // Find existing snapshot for today
    const existingCompanySnapshot = await prisma.snapshotCompany.findFirst({
      where: {
        companyId,
        snapshotDate: {
          gte: snapshotDate,
          lt: new Date(snapshotDate.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    // Create or update company snapshot
    if (existingCompanySnapshot) {
      await prisma.snapshotCompany.update({
        where: { id: existingCompanySnapshot.id },
        data: {
          reserve: currentReserve || 0,
          pctDiff,
          marketCap: companyInfo.marketCap ?? undefined,
          sharesOutstanding: companyInfo.sharesOutstanding ?? undefined,
          totalCostAccumulated,
        },
      });
    } else {
      await prisma.snapshotCompany.create({
        data: {
          companyId,
          reserve: currentReserve || 0,
          pctDiff,
          marketCap: companyInfo.marketCap ?? undefined,
          sharesOutstanding: companyInfo.sharesOutstanding ?? undefined,
          totalCostAccumulated,
          snapshotDate,
        },
      });
    }

    console.log(`Updated snapshot for company ${company.name}`);
  } catch (error) {
    console.error(`Failed to update snapshot for company ${companyId}:`, error);
  }
}

export async function POST(request: NextRequest) {
  // Verify admin authentication
  const { isAuthenticated } = await validateAdminToken(request);
  if (!isAuthenticated) {
    return createAuthErrorResponse("Admin access required");
  }

  try {
    const body = await request.json();
    const { companyId, amount, totalCost, type } = body;

    // Validate required fields
    if (!companyId || !amount || !totalCost || !type) {
      return createValidationErrorResponse(
        "Missing required fields: companyId, amount, totalCost, type"
      );
    }

    // Validate data types
    if (typeof amount !== "number" || amount <= 0) {
      return createValidationErrorResponse("Amount must be a positive number");
    }

    if (typeof totalCost !== "number" || totalCost <= 0) {
      return createValidationErrorResponse(
        "Total cost must be a positive number"
      );
    }

    if (!["buy", "yield"].includes(type)) {
      return createValidationErrorResponse(
        "Type must be either 'buy' or 'yield'"
      );
    }

    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        ticker: true,
        marketCapTracking: true,
        currentReserve: true,
        accountingType: true,
        status: true,
      },
    });

    if (!company) {
      return createValidationErrorResponse("Company not found");
    }

    // Create transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create the purchase record
      const purchase = await tx.purchase.create({
        data: {
          companyId,
          amount,
          totalCost,
          type,
        },
      });

      // Update company's current reserve
      const newCurrentReserve = (company.currentReserve || 0) + amount;
      await tx.company.update({
        where: { id: companyId },
        data: { currentReserve: newCurrentReserve },
      });

      return { purchase, newCurrentReserve };
    });

    // Update company snapshot
    await updateCompanySnapshot(companyId);

    return createSuccessResponse({
      message: "Purchase created successfully",
      purchase: result.purchase,
      newCurrentReserve: result.newCurrentReserve,
    });
  } catch (error) {
    return createErrorResponse(error, "Failed to create purchase");
  }
}

export async function GET(request: NextRequest) {
  // Verify admin authentication
  const { isAuthenticated } = await validateAdminToken(request);
  if (!isAuthenticated) {
    return createAuthErrorResponse("Admin access required");
  }

  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    const whereClause = companyId ? { companyId } : {};

    const purchases = await prisma.purchase.findMany({
      where: whereClause,
      include: {
        company: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return createSuccessResponse({ purchases });
  } catch (error) {
    return createErrorResponse(error, "Failed to fetch purchases");
  }
}
