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

    // Fetch previous overall snapshot for pctDiff calculation
    const prevSnapshot = await prisma.snapshot.findFirst({
      where: { snapshotDate: { lt: snapshotDate } },
      orderBy: { snapshotDate: "desc" },
    });
    const prevTotalReserve = prevSnapshot
      ? parseFloat(prevSnapshot.totalReserve)
      : 0;

    // Loop through companies to create/update daily SnapshotCompany and send alerts
    for (const { companyId, _sum } of companyReserves) {
      const currentReserve = _sum.balance ?? 0;

      // Find most recent previous company snapshot
      const prevCompanySnapshot = await prisma.snapshotCompany.findFirst({
        where: {
          companyId,
          snapshotDate: { lt: snapshotDate },
        },
        orderBy: { snapshotDate: "desc" },
      });
      const prevReserve = prevCompanySnapshot?.reserve ?? 0;

      const diff = currentReserve - prevReserve;
      const pctDiff =
        prevReserve > 0
          ? Math.round((diff / prevReserve) * 100 * 100) / 100
          : null;

      console.log({
        companyId,
        currentReserve,
        prevReserve,
        diff,
        pctDiff,
      });

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

        // Send email if increase > 10 ETH - only for new snapshots
        if (diff > 10 && adminEmail) {
          const company = await prisma.company.findUnique({
            where: { id: companyId },
            select: { name: true },
          });
          await resend.emails.send({
            from: "Strategic Ethereum Reserve <noreply@strategicethreserve.xyz>",
            to: adminEmail,
            subject: `Reserve up by ${diff.toFixed(2)} ETH for ${company?.name ?? companyId}`,
            html: `
              <h2>Reserve Increase Alert</h2>
              <p><strong>Company:</strong> ${company?.name ?? companyId}</p>
              <p><strong>Date:</strong> ${snapshotDate.toISOString().split("T")[0]}</p>
              <p><strong>Previous Balance:</strong> ${prevReserve.toFixed(4)} ETH</p>
              <p><strong>Current Balance:</strong> ${currentReserve.toFixed(4)} ETH</p>
              <p><strong>Percent Change:</strong> ${pctDiff?.toFixed(2)}%</p>
            `,
          });
        }
      }
    }

    // Compute overall totals
    const totalReserve = companyReserves.reduce(
      (acc, cr) => acc + (cr._sum.balance ?? 0),
      0
    );

    const totalActiveCompanies = await prisma.company.count({
      where: { status: CompanyStatus.ACTIVE },
    });
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
