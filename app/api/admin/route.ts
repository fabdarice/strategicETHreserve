import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CompanyStatus } from "@/app/interfaces/interface";
import {
  getCompaniesWithSnapshots,
  transformCompaniesForAdmin,
  getLatestETHPrice,
  validateEVMAddresses,
  syncCompanyWallets,
} from "@/lib/api/companies";
import {
  validateAdminToken,
  createUnauthorizedResponse,
  createAuthErrorResponse,
} from "@/lib/api/auth";
import {
  createErrorResponse,
  createSuccessResponse,
  createValidationErrorResponse,
} from "@/lib/api/error-handling";

export async function GET(request: NextRequest) {
  try {
    const { isAuthenticated } = await validateAdminToken(request);

    if (!isAuthenticated) {
      return createUnauthorizedResponse(request);
    }

    const companies = await getCompaniesWithSnapshots(true);
    // Filter out companies with reserves under 100 ETH for ACTIVE and IN_REVIEW companies only
    const filteredCompanies = companies.filter((company) => {
      const reserve = company.currentReserve || 0;
      // Only apply reserve filter to ACTIVE and IN_REVIEW companies
      if (
        company.status === CompanyStatus.ACTIVE ||
        company.status === CompanyStatus.IN_REVIEW
      ) {
        return reserve >= 100;
      }
      // For PENDING and INACTIVE companies, include all regardless of reserve
      return true;
    });
    const transformedCompanies =
      await transformCompaniesForAdmin(filteredCompanies);
    const lastETHPrice = await getLatestETHPrice();

    return createSuccessResponse({
      companies: transformedCompanies,
      lastETHPrice,
    });
  } catch (error) {
    return createUnauthorizedResponse(request);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { isAuthenticated } = await validateAdminToken(request);

    if (!isAuthenticated) {
      return createAuthErrorResponse();
    }

    const { type, id, data } = await request.json();

    if (!type || !id || !data) {
      return createValidationErrorResponse("Missing type, id, or data");
    }

    // Remove read-only fields
    delete data.reserve;
    delete data.pctDiff;
    delete data.snapshotDate;

    let result;

    if (type === "company") {
      result = await updateCompany(id, data);
    } else if (type === "influencer") {
      result = await prisma.influencer.update({
        where: { id },
        data,
      });
    } else {
      return createValidationErrorResponse("Invalid type");
    }

    return createSuccessResponse(result);
  } catch (error) {
    return createErrorResponse(error, "Error updating data");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { isAuthenticated } = await validateAdminToken(request);

    if (!isAuthenticated) {
      return createUnauthorizedResponse(request);
    }

    const { type, data } = await request.json();

    if (!type || !data) {
      return createUnauthorizedResponse(request);
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
      return createUnauthorizedResponse(request);
    }

    return createSuccessResponse(result);
  } catch (error) {
    return createUnauthorizedResponse(request);
  }
}

async function updateCompany(id: string, data: any) {
  // Remove null values from data object
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== null)
  );

  // Validate addresses array
  const addresses = cleanData.addresses;
  if (!Array.isArray(addresses)) {
    throw new Error("Addresses must be an array");
  }

  const validation = validateEVMAddresses(addresses);
  if (!validation.valid) {
    throw new Error(`Invalid EVM address: ${validation.invalidAddress}`);
  }

  // Update company and synchronize wallets in a transaction
  return await prisma.$transaction(async (tx) => {
    // Update company record
    const updatedCompany = await tx.company.update({
      where: { id },
      data: cleanData,
    });

    if (data.status === CompanyStatus.INACTIVE) {
      await tx.companyWallet.deleteMany({
        where: { companyId: id },
      });
      return updatedCompany;
    }

    // Sync company wallets for any new addresses
    await syncCompanyWallets(id, addresses);
    return updatedCompany;
  });
}
