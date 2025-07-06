import { prisma } from "@/lib/prisma";
import {
  AccountingType,
  CompanyStatus,
  Company,
  AdminCompany,
} from "@/app/interfaces/interface";

export async function getCompaniesWithSnapshots(isAdmin: boolean = false) {
  const companies = await prisma.company.findMany({
    select: {
      id: true,
      name: true,
      category: true,
      secondaryCategory: true,
      ticker: true,
      currentReserve: true,
      logo: true,
      website: true,
      status: true,
      contact: true,
      accountingType: true,
      news: true,
      createdAt: true,
      updatedAt: true,
      addresses: isAdmin,
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
        take: 7,
      },
    },
    where: isAdmin
      ? {
          status: {
            not: CompanyStatus.INACTIVE,
          },
        }
      : undefined,
    orderBy: {
      createdAt: "desc",
    },
  });

  return companies;
}

export async function transformCompaniesForAdmin(
  companies: any[]
): Promise<AdminCompany[]> {
  return companies.map((company) => {
    const latestSnapshot =
      company.snapshots.length > 0 ? company.snapshots[0] : null;
    const reserve = latestSnapshot ? latestSnapshot.reserve : 0;
    const { snapshots, ...companyData } = company;

    return {
      ...companyData,
      reserve,
      snapshotDate: latestSnapshot?.snapshotDate || null,
      status: companyData.status as CompanyStatus,
      accountingType: companyData.accountingType as AccountingType,
    };
  });
}

export async function transformCompaniesForPublic(
  companies: any[]
): Promise<Company[]> {
  return Promise.all(
    companies.map(async (company) => {
      const latestSnapshot =
        company.snapshots.length > 0 ? company.snapshots[0] : null;

      // Check if company is older than 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const companyCreatedAt = new Date(company.createdAt);
      const isCompanyOlderThan30Days = companyCreatedAt <= thirtyDaysAgo;

      let prevSnapshot;
      if (isCompanyOlderThan30Days) {
        // Fetch snapshot from ~30 days ago for companies older than 30 days
        prevSnapshot = await prisma.snapshotCompany.findFirst({
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
      } else {
        // Pick the oldest snapshot for companies newer than 30 days
        prevSnapshot = await prisma.snapshotCompany.findFirst({
          where: {
            companyId: company.id,
          },
          orderBy: {
            snapshotDate: "asc",
          },
          select: {
            reserve: true,
            snapshotDate: true,
          },
        });
      }

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
}

export async function getLatestETHPrice(): Promise<number> {
  const lastETHPrice = await prisma.snapshot.findFirst({
    orderBy: {
      snapshotDate: "desc",
    },
    select: {
      currentUSDPrice: true,
    },
  });

  return lastETHPrice?.currentUSDPrice || 0;
}

export function validateEVMAddresses(addresses: string[]): {
  valid: boolean;
  invalidAddress?: string;
} {
  const evmRegex = /^0x[a-fA-F0-9]{40}$/;
  const invalidAddress = addresses.find(
    (addr) => typeof addr !== "string" || !evmRegex.test(addr)
  );

  return invalidAddress ? { valid: false, invalidAddress } : { valid: true };
}

export async function syncCompanyWallets(
  companyId: string,
  addresses: string[]
) {
  const existingWallets = await prisma.companyWallet.findMany({
    where: { companyId },
    select: { address: true },
  });

  const existingAddressesSet = new Set(
    existingWallets.map((w) => w.address.toLowerCase())
  );

  const newWalletsData = addresses
    .filter((addr) => !existingAddressesSet.has(addr.toLowerCase()))
    .map((addr) => ({
      companyId,
      address: addr,
      balance: 0,
    }));

  if (newWalletsData.length > 0) {
    await prisma.companyWallet.createMany({ data: newWalletsData });
  }
}
