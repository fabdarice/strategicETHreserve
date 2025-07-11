import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { AccountingType, CompanyStatus } from "@/app/interfaces/interface";
import { getETHPrice } from "@/lib/web3";
import { fetchCompanyInfo, CompanyInfo } from "@/lib/companyinfo";
import { fetchCryptoInfo, CryptoInfo } from "@/lib/cryptoinfo";
import { validateCronToken, createAuthErrorResponse } from "@/lib/api/auth";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/api/error-handling";
import { createSnapshotDate } from "@/lib/api/snapshots";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY);
const adminEmail = process.env.ADMIN_EMAIL || "fabrice.cheng@gmail.com";

export async function GET(request: NextRequest) {
  // Verify this is called by Vercel Cron
  const { isAuthenticated } = validateCronToken(request);
  if (!isAuthenticated) {
    return createAuthErrorResponse();
  }

  try {
    const snapshotDate = createSnapshotDate();
    const ethPrice = await getETHPrice();

    // Fetch all required data in parallel
    const [companyReserves, allCompanies, prevSnapshot] = await Promise.all([
      prisma.companyWallet.groupBy({
        by: ["companyId"],
        _sum: { balance: true },
      }),
      prisma.company.findMany({
        select: {
          id: true,
          name: true,
          ticker: true,
          marketCapTracking: true,
          currentReserve: true,
          accountingType: true,
          status: true,
        },
        where: {
          status: {
            not: CompanyStatus.INACTIVE,
          },
        },
      }),
      prisma.snapshot.findFirst({
        where: { snapshotDate: { lt: snapshotDate } },
        orderBy: { snapshotDate: "desc" },
      }),
    ]);

    // Create a map of companyId to wallet balance
    const companyWalletBalances = new Map(
      companyReserves.map(({ companyId, _sum }) => [
        companyId,
        _sum.balance ?? 0,
      ])
    );

    const prevTotalReserve = prevSnapshot
      ? parseFloat(prevSnapshot.totalReserve)
      : 0;

    // Process all companies in parallel
    const companySnapshotPromises = allCompanies.map(async (company) => {
      return await processCompanySnapshot(
        company,
        companyWalletBalances,
        snapshotDate,
        adminEmail
      );
    });

    // Wait for all company snapshots to be processed
    await Promise.all(companySnapshotPromises);

    // Calculate and create overall snapshot
    await createOverallSnapshot(snapshotDate, prevTotalReserve, ethPrice);

    return createSuccessResponse({
      message: "Daily snapshots created/updated",
    });
  } catch (error) {
    return createErrorResponse(error, "Daily snapshot cron error");
  }
}

async function processCompanySnapshot(
  company: any,
  companyWalletBalances: Map<string, number>,
  snapshotDate: Date,
  adminEmail: string
) {
  const companyId = company.id;
  const currentReserve =
    companyWalletBalances.has(companyId) &&
    company.accountingType === AccountingType.WALLET_TRACKING
      ? companyWalletBalances.get(companyId)!
      : company.currentReserve;

  // Fetch company info if company qualifies (ACTIVE, has ticker, marketCapTracking is "Public Listing" or "crypto")
  let companyInfo: CompanyInfo = { marketCap: null, sharesOutstanding: null };
  if (
    company.status === CompanyStatus.ACTIVE &&
    company.ticker &&
    company.marketCapTracking === "Public Listing"
  ) {
    try {
      companyInfo = await fetchCompanyInfo(company.ticker);
      console.log(
        `Fetched company info for ${company.name} (${company.ticker}): MarketCap: ${companyInfo.marketCap}, SharesOutstanding: ${companyInfo.sharesOutstanding}`
      );
    } catch (error) {
      console.error(
        `Failed to fetch company info for ${company.name} (${company.ticker}):`,
        error
      );
    }
  } else if (
    company.status === CompanyStatus.ACTIVE &&
    company.ticker &&
    company.marketCapTracking === "Crypto"
  ) {
    try {
      const cryptoInfo = await fetchCryptoInfo(company.ticker);
      // Convert CryptoInfo to CompanyInfo format
      companyInfo = {
        marketCap: cryptoInfo.marketCap,
        sharesOutstanding: null, // Crypto doesn't have shares outstanding
      };
      console.log(
        `Fetched crypto info for ${company.name} (${company.ticker}): MarketCap: ${cryptoInfo.marketCap}, Price: ${cryptoInfo.price}`
      );
    } catch (error) {
      console.error(
        `Failed to fetch crypto info for ${company.name} (${company.ticker}):`,
        error
      );
    }
  }

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

  const diff = currentReserve - prevReserve;
  const pctDiff =
    prevReserve > 0 ? Math.round((diff / prevReserve) * 100 * 100) / 100 : null;

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
        reserve: currentReserve,
        pctDiff,
        marketCap: companyInfo.marketCap ?? undefined,
        sharesOutstanding: companyInfo.sharesOutstanding ?? undefined,
      },
    });
    if (Math.abs(existingCompanySnapshot.reserve - currentReserve) > 10) {
      await sendChangeAlert(
        company,
        pctDiff,
        diff,
        prevReserve,
        currentReserve,
        snapshotDate,
        adminEmail
      );
    }
  } else {
    await prisma.snapshotCompany.create({
      data: {
        companyId,
        reserve: currentReserve,
        pctDiff,
        marketCap: companyInfo.marketCap ?? undefined,
        sharesOutstanding: companyInfo.sharesOutstanding ?? undefined,
        snapshotDate,
      },
    });

    await sendChangeAlert(
      company,
      pctDiff,
      diff,
      prevReserve,
      currentReserve,
      snapshotDate,
      adminEmail
    );
  }
}

async function sendChangeAlert(
  company: any,
  pctDiff: number | null,
  diff: number,
  prevReserve: number,
  currentReserve: number,
  snapshotDate: Date,
  adminEmail: string
) {
  if (
    adminEmail &&
    ((pctDiff && (pctDiff > 1 || pctDiff < -1)) || diff >= 50)
  ) {
    try {
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
    } catch (error) {
      console.error(`Failed to send email for company ${company.name}:`, error);
    }
  }
}

async function createOverallSnapshot(
  snapshotDate: Date,
  prevTotalReserve: number,
  ethPrice: number
) {
  // Fetch the company snapshots that were just created/updated for today
  const todayCompanySnapshots = await prisma.snapshotCompany.findMany({
    where: {
      snapshotDate: {
        gte: snapshotDate,
        lt: new Date(snapshotDate.getTime() + 24 * 60 * 60 * 1000),
      },
      company: {
        status: CompanyStatus.ACTIVE,
      },
    },
    include: {
      company: {
        select: {
          status: true,
        },
      },
    },
  });

  // Filter snapshots for companies with reserve > 100 ETH (matching frontend logic)
  const eligibleSnapshots = todayCompanySnapshots.filter(
    (snapshot) => snapshot.reserve > 100
  );

  // Calculate totals from the snapshots (matching what frontend will display)
  const totalReserve = eligibleSnapshots.reduce(
    (acc, snapshot) => acc + snapshot.reserve,
    0
  );

  const totalActiveCompanies = eligibleSnapshots.length;
  const overallDiff = totalReserve - prevTotalReserve;
  const overallPctDiff =
    prevTotalReserve > 0
      ? Math.round((overallDiff / prevTotalReserve) * 100 * 100) / 100
      : null;

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
}
