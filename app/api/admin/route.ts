import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AdminCompany, Company, Influencer } from "@/app/interfaces/interface";
import { AccountingType } from "@/app/interfaces/interface";
import { CompanyStatus } from "@/app/interfaces/interface";

export async function GET(request: Request): Promise<
  NextResponse<
    | {
        companies: AdminCompany[];
        influencers: Influencer[];
        lastETHPrice: number;
      }
    | { message: string }
    | unknown
  >
> {
  try {
    const token = request.headers.get("Authorization")?.split("Bearer ")?.[1];

    // If there's no token or invalid token, redirect to homepage
    if (!token || token !== process.env.ADMIN_PASSWORD) {
      return NextResponse.redirect(new URL("/", request.url), { status: 302 });
    }

    // Get all companies with their latest snapshot
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        currentReserve: true,
        logo: true,
        website: true,
        status: true,
        contact: true,
        accountingType: true,
        news: true,
        createdAt: true,
        updatedAt: true,
        addresses: true,
        twitter: true,
        snapshots: {
          select: {
            reserve: true,
            pctDiff: true,
            snapshotDate: true,
          },
          orderBy: {
            snapshotDate: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform response to include reserve from snapshot or company
    const transformedCompanies: AdminCompany[] = companies.map((company) => {
      const latestSnapshot =
        company.snapshots.length > 0 ? company.snapshots[0] : null;
      const reserve = latestSnapshot
        ? latestSnapshot.reserve
        : company.currentReserve;
      const pctDiff = latestSnapshot?.pctDiff || null;

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
    });

    const influencers = await prisma.influencer.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const lastETHPrice = await prisma.snapshot.findFirst({
      orderBy: {
        snapshotDate: "desc",
      },
      select: {
        currentUSDPrice: true,
      },
    });

    return NextResponse.json({
      companies: transformedCompanies,
      influencers,
      lastETHPrice: lastETHPrice?.currentUSDPrice || 0,
    });
  } catch (error) {
    console.error("Error fetching admin data:", error);
    return NextResponse.redirect(new URL("/", request.url), { status: 302 });
  }
}

export async function PUT(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.split("Bearer ")?.[1];

    // If there's no token or invalid token, redirect to homepage
    if (!token || token !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, id, data } = await request.json();

    if (!type || !id || !data) {
      return NextResponse.json(
        { error: "Missing type, id, or data" },
        { status: 400 }
      );
    }

    delete data.reserve;
    delete data.pctDiff;
    delete data.snapshotDate;

    let result;
    if (type === "company") {
      // Validate addresses array
      const addresses = data.addresses;
      if (!Array.isArray(addresses)) {
        return NextResponse.json(
          { error: "Addresses must be an array" },
          { status: 400 }
        );
      }
      // Validate each address as EVM address
      const evmRegex = /^0x[a-fA-F0-9]{40}$/;
      const invalidAddress = addresses.find(
        (addr: string) => typeof addr !== "string" || !evmRegex.test(addr)
      );
      if (invalidAddress) {
        return NextResponse.json(
          { error: `Invalid EVM address: ${invalidAddress}` },
          { status: 400 }
        );
      }
      // Update company and synchronize wallets in a transaction
      result = await prisma.$transaction(async (tx) => {
        // Update company record
        const updatedCompany = await tx.company.update({
          where: { id },
          data,
        });
        // Sync company wallets for any new addresses
        const existingWallets = await tx.companyWallet.findMany({
          where: { companyId: id },
          select: { address: true },
        });
        const existingAddressesSet = new Set(
          existingWallets.map((w) => w.address.toLowerCase())
        );
        const newWalletsData = addresses
          .filter(
            (addr: string) => !existingAddressesSet.has(addr.toLowerCase())
          )
          .map((addr: string) => ({
            companyId: id,
            address: addr,
            balance: 0,
          }));
        if (newWalletsData.length > 0) {
          await tx.companyWallet.createMany({ data: newWalletsData });
        }
        return updatedCompany;
      });
    } else if (type === "influencer") {
      result = await prisma.influencer.update({
        where: { id },
        data,
      });
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.split("Bearer ")?.[1];

    // If there's no token or invalid token, redirect to homepage
    if (!token || token !== process.env.ADMIN_PASSWORD) {
      return NextResponse.redirect(new URL("/", request.url), { status: 302 });
    }

    const { type, data } = await request.json();

    if (!type || !data) {
      return NextResponse.redirect(new URL("/", request.url), { status: 302 });
    }

    let result;
    if (type === "influencer") {
      result = await prisma.influencer.create({
        data: {
          name: data.name,
          description: data.description,
          commitment: data.commitment,
          twitter: data.twitter,
        },
      });
    } else {
      return NextResponse.redirect(new URL("/", request.url), { status: 302 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating data:", error);
    return NextResponse.redirect(new URL("/", request.url), { status: 302 });
  }
}
