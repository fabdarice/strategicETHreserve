import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { CompanyStatus } from "@/app/interfaces/interface";
import { getETHPrice } from "@/lib/web3";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY);
const adminEmail = process.env.ADMIN_EMAIL || "fabrice.cheng@gmail.com";

export async function GET(req: NextRequest) {
  // Verify this is called by Vercel Cron
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Determine today's snapshot date at UTC midnight
    const now = new Date();
    const snapshotDate = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        0,
        0,
        0
      )
    );

    // Aggregate current reserves per company
    const companyReserves = await prisma.companyWallet.groupBy({
      by: ["companyId"],
      _sum: { balance: true },
    });

    // Get all active companies to ensure we include those without wallets
    const activeCompanies = await prisma.company.findMany({
      where: { status: CompanyStatus.ACTIVE },
      select: { id: true, name: true, currentReserve: true },
    });

    // Create a map of companyId to wallet balance
    const companyWalletBalances = new Map(
      companyReserves.map(({ companyId, _sum }) => [
        companyId,
        _sum.balance ?? 0,
      ])
    );

    // Fetch previous overall snapshot for pctDiff calculation
    const prevSnapshot = await prisma.snapshot.findFirst({
      where: { snapshotDate: { lt: snapshotDate } },
      orderBy: { snapshotDate: "desc" },
    });
    const prevTotalReserve = prevSnapshot
      ? parseFloat(prevSnapshot.totalReserve)
      : 0;

    // Loop through all active companies
    for (const company of activeCompanies) {
      const companyId = company.id;

      // Use wallet balance if available, otherwise use company's currentReserve
      const currentReserve = companyWalletBalances.has(companyId)
        ? companyWalletBalances.get(companyId)!
        : company.currentReserve;

      // Find most recent previous company snapshot
      const prevCompanySnapshot = await prisma.snapshotCompany.findFirst({
        where: {
          companyId,
          snapshotDate: { lt: snapshotDate },
        },
        orderBy: { snapshotDate: "desc" },
      });

      // If no previous snapshot exists, use company's currentReserve or default to 0
      const prevReserve =
        prevCompanySnapshot?.reserve ?? company.currentReserve ?? 0;

      const diff = currentReserve - prevReserve;
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
          data: { reserve: currentReserve, pctDiff },
        });
      } else {
        await prisma.snapshotCompany.create({
          data: {
            companyId,
            reserve: currentReserve,
            pctDiff,
            snapshotDate,
          },
        });

        // Send email if pctDiff is greater than 10% or less than -10%
        if (pctDiff && (pctDiff > 10 || pctDiff < -10) && adminEmail) {
          await resend.emails.send({
            from: "Strategic Ethereum Reserve <noreply@strategicethreserve.xyz>",
            to: adminEmail,
            subject: `Reserve changed by ${pctDiff?.toFixed(2)}% for ${company.name}`,
            html: `
              <h2>Reserve Change Alert</h2>
              <p><strong>Company:</strong> ${company.name}</p>
              <p><strong>Date:</strong> ${snapshotDate.toISOString().split("T")[0]}</p>
              <p><strong>Previous Balance:</strong> ${prevReserve.toFixed(4)} ETH</p>
              <p><strong>Current Balance:</strong> ${currentReserve.toFixed(4)} ETH</p>
              <p><strong>Percent Change:</strong> ${pctDiff?.toFixed(2)}%</p>
            `,
          });
        }
      }
    }

    // Compute overall totals - now we need to sum across all companies
    const totalReserve = activeCompanies.reduce((acc, company) => {
      const balance = companyWalletBalances.has(company.id)
        ? companyWalletBalances.get(company.id)!
        : company.currentReserve;
      return acc + balance;
    }, 0);

    const totalActiveCompanies = activeCompanies.length;
    const overallDiff = totalReserve - prevTotalReserve;
    const overallPctDiff =
      prevTotalReserve > 0
        ? Math.round((overallDiff / prevTotalReserve) * 100 * 100) / 100
        : null;

    const ethPrice = await getETHPrice();
    const totalReserveUSD = totalReserve * ethPrice;

    // Find existing overall snapshot for today
    const existingSnapshot = await prisma.snapshot.findFirst({
      where: {
        snapshotDate: {
          gte: snapshotDate,
          lt: new Date(snapshotDate.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    // Create or update overall snapshot
    if (existingSnapshot) {
      await prisma.snapshot.update({
        where: { id: existingSnapshot.id },
        data: {
          totalReserve: totalReserve.toString(),
          totalCompanies: totalActiveCompanies,
          pctDiff: overallPctDiff,
          totalReserveUSD,
          currentUSDPrice: ethPrice,
        },
      });
    } else {
      await prisma.snapshot.create({
        data: {
          totalReserve: totalReserve.toString(),
          totalCompanies: totalActiveCompanies,
          pctDiff: overallPctDiff,
          snapshotDate,
          totalReserveUSD,
          currentUSDPrice: ethPrice,
        },
      });
    }

    return NextResponse.json({
      message: "Daily snapshots created/updated",
    });
  } catch (error) {
    console.error("Daily snapshot cron error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Unexpected error" },
      { status: 500 }
    );
  }
}
