import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const CompanySchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  description: z.string().min(1),
  commitmentPercentage: z.number().min(0).max(100),
  currentReserve: z.number().min(0),
  addresses: z.array(z.string()),
});

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      orderBy: {
        commitmentPercentage: 'desc',
      },
    });
    return NextResponse.json(companies);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = CompanySchema.parse(body);
    
    const company = await prisma.company.create({
      data: validatedData,
    });
    
    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
  }
}