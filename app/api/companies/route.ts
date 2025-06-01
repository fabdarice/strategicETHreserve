import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import {
  AccountingType,
  Company,
  CompanyStatus,
} from "@/app/interfaces/interface";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(): Promise<
  NextResponse<
    | {
        companies: Company[];
        lastETHPrice: number;
      }
    | { message: string }
  >
> {
  try {
    // Get all companies with their most recent snapshot
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        currentReserve: true,
        logo: true,
        website: true,
        twitter: true,
        status: true,
        contact: true,
        accountingType: true,
        news: true,
        createdAt: true,
        updatedAt: true,
        snapshots: {
          select: {
            reserve: true,
            snapshotDate: true,
          },
          orderBy: {
            snapshotDate: "desc",
          },
          take: 1, // Only get the most recent snapshot
        },
      },
    });

    // Transform response to include reserve from snapshot or company
    const transformedCompanies: Company[] = await Promise.all(
      companies.map(async (company) => {
        const latestSnapshot =
          company.snapshots.length > 0 ? company.snapshots[0] : null;

        // Fetch snapshot from ~30 days ago for this company
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const prevSnapshot = await prisma.snapshotCompany.findFirst({
          where: {
            companyId: company.id,
            snapshotDate: {
              lte: thirtyDaysAgo,
            },
          },
          orderBy: {
            snapshotDate: "desc",
          },
          select: {
            reserve: true,
            snapshotDate: true,
          },
        });

        const reserve =
          latestSnapshot &&
          company.accountingType === AccountingType.WALLET_TRACKING
            ? latestSnapshot.reserve
            : company.currentReserve;
        const pctDiff =
          latestSnapshot && prevSnapshot
            ? ((latestSnapshot.reserve - prevSnapshot.reserve) /
                prevSnapshot.reserve) *
              100
            : 0;

        // Remove snapshots array and add flattened data
        const { snapshots, ...companyData } = company;

        return {
          ...companyData,
          reserve,
          pctDiff,
          snapshotDate: latestSnapshot?.snapshotDate || null,
          status: companyData.status as CompanyStatus,
          accountingType: companyData.accountingType as AccountingType,
        };
      })
    );

    // Sort by reserve in descending order
    transformedCompanies.sort((a, b) => b.reserve - a.reserve);

    // Filter out companies with reserve less than 100
    const filteredCompanies = transformedCompanies.filter(
      (company) => company.reserve > 100
    );

    const lastETHPrice = await prisma.snapshot.findFirst({
      orderBy: {
        snapshotDate: "desc",
      },
      select: {
        currentUSDPrice: true,
      },
    });

    return NextResponse.json({
      companies: filteredCompanies,
      lastETHPrice: lastETHPrice?.currentUSDPrice || 0,
    });
  } catch (error) {
    console.error("Failed to fetch companies:", error);
    return NextResponse.json(
      { message: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      category = "Other",
      logoUrl = "",
      website = null,
      twitter = null,
      currentReserve = 0,
      addresses = [],
      contact = "",
    } = body;

    // Ensure addresses is an array and filter out empty strings
    const addressesArray = Array.isArray(addresses)
      ? addresses.filter((addr) => addr.trim() !== "")
      : [];

    const company = await prisma.company.create({
      data: {
        name,
        category,
        logo: logoUrl,
        website,
        twitter,
        currentReserve,
        addresses: addressesArray,
        status: CompanyStatus.PENDING.toString(),
        contact,
      },
    });

    // Send email notification
    await resend.emails.send({
      from: "Strategic Ethereum Reserve <noreply@strategicethreserve.xyz>",
      to: process.env.ADMIN_EMAIL || "fabrice.cheng@gmail.com",
      subject: "New Company Submission",
      html: `
        <h2>New Company Submission</h2>
        <p>A new company has submitted their commitment to SER:</p>
        <ul>
          <li><strong>Name:</strong> ${name}</li>
          <li><strong>Category:</strong> ${category}</li>
          <li><strong>Website:</strong> ${website || "Not provided"}</li>          
          <li><strong>Twitter:</strong> ${twitter || "Not provided"}</li>          
          <li><strong>Current Reserve:</strong> ${currentReserve} ETH</li>
          <li><strong>Addresses:</strong> ${addressesArray.join(", ")}</li>
          <li><strong>Contact:</strong> ${contact}</li>
        </ul>
        <p>Please review and update their status in the admin panel.</p>
      `,
    });

    return NextResponse.json(company);
  } catch (error) {
    console.error("Failed to create company:", error);
    return NextResponse.json(
      { message: "Failed to create company" },
      { status: 500 }
    );
  }
}
