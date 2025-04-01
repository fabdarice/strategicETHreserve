import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.split("Bearer ")?.[1];

    // If there's no token, redirect to login
    if (!token || token !== process.env.ADMIN_PASSWORD) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const [companies, influencers] = await Promise.all([
      prisma.company.findMany(),
      prisma.influencer.findMany(),
    ]);

    return NextResponse.json({ companies, influencers });
  } catch (error) {
    console.error("Error fetching admin data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.split("Bearer ")?.[1];

    // If there's no token, redirect to login
    if (!token || token !== process.env.ADMIN_PASSWORD) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const { type, id, data } = await request.json();

    if (!type || !id || !data) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let result;
    if (type === "company") {
      result = await prisma.company.update({
        where: { id },
        data,
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
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.split("Bearer ")?.[1];

    // If there's no token, redirect to login
    if (!token || token !== process.env.ADMIN_PASSWORD) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const { type, data } = await request.json();

    if (!type || !data) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
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
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
