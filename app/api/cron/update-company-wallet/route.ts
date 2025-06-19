import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getETHBalanceAllNetworks } from "@/lib/web3";
import { validateCronToken, createAuthErrorResponse } from "@/lib/api/auth";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/api/error-handling";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  // Verify this is called by Vercel Cron
  const { isAuthenticated } = validateCronToken(request);
  if (!isAuthenticated) {
    return createAuthErrorResponse();
  }

  try {
    // Fetch the oldest company wallet by updatedAt
    const wallet = await prisma.companyWallet.findFirst({
      orderBy: { updatedAt: "asc" },
      where: { autoScan: true },
    });

    if (!wallet) {
      return createSuccessResponse({
        message: "No company wallets found to update",
      });
    }

    const { id: walletId, address } = wallet;

    // Calculate total balance (includes validator balance internally)
    const totalBalanceWei = await getETHBalanceAllNetworks(address);

    // Convert from Wei to ETH and round to 4 decimal places
    const totalBalanceEth = Number((Number(totalBalanceWei) / 1e18).toFixed(4));

    // Update the CompanyWallet's balance field
    await prisma.companyWallet.update({
      where: { id: walletId },
      data: { balance: totalBalanceEth },
    });

    return createSuccessResponse({
      message: "Company wallet balance updated",
    });
  } catch (error) {
    return createErrorResponse(error, "Cron update error");
  }
}
