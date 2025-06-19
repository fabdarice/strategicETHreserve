import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { CompanyStatus } from "@/app/interfaces/interface";
import {
  getCompaniesWithSnapshots,
  transformCompaniesForPublic,
  getLatestETHPrice,
} from "@/lib/api/companies";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/api/error-handling";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    const companies = await getCompaniesWithSnapshots();
    const transformedCompanies = await transformCompaniesForPublic(companies);

    // Sort by reserve in descending order
    transformedCompanies.sort((a, b) => b.reserve - a.reserve);

    // Filter out companies with reserve less than 100
    const filteredCompanies = transformedCompanies.filter(
      (company) => company.reserve > 100
    );

    const lastETHPrice = await getLatestETHPrice();

    return createSuccessResponse({
      companies: filteredCompanies,
      lastETHPrice,
    });
  } catch (error) {
    return createErrorResponse(error, "Failed to fetch companies");
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

    return createSuccessResponse(company);
  } catch (error) {
    return createErrorResponse(error, "Failed to create company");
  }
}
