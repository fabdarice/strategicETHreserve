"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from '@/components/ui/button';
import SubmitCompanyDialog from '@/components/SubmitCompanyDialog';
import Image from "next/image";

interface Company {
  id: string;
  name: string;
  category: string;
  description: string;
  commitmentPercentage: number;
  logo: string;
  currentReserve: number;
  dateCommitment: Date;
}

export default function CompanyTable({ companies }: { companies: Company[] }) {
  return (
    <div className="rounded-lg border border-[hsl(var(--primary))] bg-card/80 backdrop-blur-sm neon-border overflow-hidden flex-1">
      <div className="p-6 md:flex md:justify-between gap-2">
        <div>
          <Image src="/images/seralignedcompanies.svg" alt="Ethereum Aligned Companies" width={300} height={50} className="mb-2" />
          <p className="text-sm text-center">
            Companies allocating a portion of their revenue to SER.
          </p>

        </div>
        <div className="mt-2 md:mt-0 text-center md:text-left">
          <SubmitCompanyDialog>
            <Button
              size="lg"
              className="bg-[hsl(var(--primary))] text-secondary hover:bg-[hsl(var(--primary-foreground))] neon-border"
            >
              <Image src="/images/joinmovement.svg" width={150} height={20} alt="Join Movement" />
            </Button>
          </SubmitCompanyDialog>
        </div>
      </div >
      <Table>
        <TableHeader>
          <TableRow className="border-[hsl(var(--primary))]">
            <TableHead className="text-[hsl(var(--primary))]">COMPANY</TableHead>
            <TableHead className="text-[hsl(var(--primary))] hidden sm:table-cell">CATEGORY</TableHead>
            <TableHead className="text-[hsl(var(--primary))]">ALLOCATION</TableHead>
            <TableHead className="text-right text-[hsl(var(--primary))]">RESERVE</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow key={company.id} className="border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))/0.1] transition-colors">
              <TableCell className="font-medium">
                <div className='flex gap-2'>
                  <Image src={company.logo} alt="OP" width={20} height={20} />
                  {company.name}
                </div>

              </TableCell>
              <TableCell className="hidden sm:table-cell">{company.category}</TableCell>
              <TableCell className="text-center md:text-left">{company.commitmentPercentage}%</TableCell>
              <TableCell className="text-right">{company.currentReserve.toLocaleString()} ETH</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div >
  );
}
