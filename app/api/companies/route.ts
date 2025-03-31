import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(companies);
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
      category,
      logoUrl,
      website,
      commitmentPercentage,
      currentReserve,
      addresses,
    } = body;

    const company = await prisma.company.create({
      data: {
        name,
        category,
        logo: logoUrl,
        website,
        commitmentPercentage,
        currentReserve,
        addresses,
        status: "PENDING",
        description: `${name} is committed to holding ${commitmentPercentage}% of their treasury in ETH.`,
      },
    });

    // Send email notification
    await resend.emails.send({
      from: "Strategic Ethereum Reserve <noreply@strategicethreserve.xyz>",
      to: process.env.ADMIN_EMAIL || "admin@strategicethreserve.xyz",
      subject: "New Company Submission",
      html: `
        <h2>New Company Submission</h2>
        <p>A new company has submitted their commitment to SER:</p>
        <ul>
          <li><strong>Name:</strong> ${name}</li>
          <li><strong>Category:</strong> ${category}</li>
          <li><strong>Website:</strong> ${website || "Not provided"}</li>
          <li><strong>Commitment:</strong> ${commitmentPercentage}%</li>
          <li><strong>Current Reserve:</strong> ${currentReserve} ETH</li>
          <li><strong>Addresses:</strong> ${addresses.join(", ")}</li>
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
