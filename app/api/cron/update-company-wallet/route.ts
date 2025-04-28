import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getETHBalanceAllNetworks } from "@/lib/web3";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  // Verify this is called by Vercel Cron
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch the oldest company wallet by updatedAt
    const wallet = await prisma.companyWallet.findFirst({
      orderBy: { updatedAt: "asc" },
    });

    if (!wallet) {
      return NextResponse.json({
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

    return NextResponse.json({
      message: "Company wallet balance updated",
    });
  } catch (error) {
    console.error("Cron update error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Unexpected error" },
      { status: 500 }
    );
  }
}
