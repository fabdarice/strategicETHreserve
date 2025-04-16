import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.split("Bearer ")?.[1];

    // If there's no token or invalid token, redirect to homepage
    if (!token || token !== process.env.ADMIN_PASSWORD) {
      return NextResponse.redirect(new URL("/", request.url), { status: 302 });
    }

    const [companies, influencers] = await Promise.all([
      prisma.company.findMany({
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.influencer.findMany({
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    return NextResponse.json({ companies, influencers });
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
      return NextResponse.redirect(new URL("/", request.url), { status: 302 });
    }

    const { type, id, data } = await request.json();

    if (!type || !id || !data) {
      return NextResponse.redirect(new URL("/", request.url), { status: 302 });
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
      return NextResponse.redirect(new URL("/", request.url), { status: 302 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating data:", error);
    return NextResponse.redirect(new URL("/", request.url), { status: 302 });
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
