import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const InfluencerSchema = z.object({
  name: z.string().min(1),
  avatar: z.string().url().optional(),
  description: z.string().min(1),
  commitment: z.string().min(1),
  twitter: z.string().optional(),
});

export async function GET() {
  try {
    const influencers = await prisma.influencer.findMany({
      orderBy: {
        createdAt: "asc",
      },
    });
    return NextResponse.json(influencers);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch influencers" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const token = req.headers.get("Authorization")?.split("Bearer ")?.[1];

    // If there's no token, redirect to login
    if (!token || token !== process.env.ADMIN_PASSWORD) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    const body = await req.json();
    const validatedData = InfluencerSchema.parse(body);

    const influencer = await prisma.influencer.create({
      data: validatedData,
    });

    return NextResponse.json(influencer, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create influencer" },
      { status: 500 }
    );
  }
}
