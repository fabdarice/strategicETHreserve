"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import SubmitCompanyDialog from "@/components/SubmitCompanyDialog";
import Image from "next/image";
import { Company, AccountingType } from "@/app/interfaces/interface";
import { ExternalLink, Newspaper } from "lucide-react";

// Helper function to check if a date is within the last 7 days
const isNew = (date: Date): boolean => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return new Date(date) > sevenDaysAgo;
};

export default function CompanyTable({ companies }: { companies: Company[] }) {
  const activeCompanies = companies.filter(
    (company) => company.status === "ACTIVE"
  );

  return (
    <div className="rounded-lg border border-[hsl(var(--primary))] bg-card/80 backdrop-blur-sm neon-border overflow-hidden flex-1">
      <div className="p-6 md:flex md:justify-between gap-2">
        <div>
          <Image
            src="/images/seralignedcompanies.svg"
            alt="Ethereum Aligned Companies"
            width={300}
            height={50}
            className="mb-2"
          />
          <p className="text-xs text-center md:text-sm md:text-left">
            Entities holding $ETH in their treasury
          </p>
        </div>
        <div className="mt-2 md:mt-0 text-center md:text-left">
          <SubmitCompanyDialog>
            <Button
              size="lg"
              className="bg-[hsl(var(--primary))] text-secondary hover:bg-[hsl(var(--primary-foreground))] neon-border"
            >
              <Image
                src="/images/joinmovement.svg"
                width={150}
                height={20}
                alt="Join Movement"
              />
            </Button>
          </SubmitCompanyDialog>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-[hsl(var(--primary)/0.3)]">
            <TableHead className="text-[hsl(var(--primary))]">
              ENTITIES
            </TableHead>
            <TableHead className="text-[hsl(var(--primary))] hidden sm:table-cell">
              CATEGORY
            </TableHead>
            <TableHead className="text-right text-[hsl(var(--primary))]">
              RESERVE <span className="sm:hidden ml-1">ETH</span>
            </TableHead>
            <TableHead className="text-center text-[hsl(var(--primary))] hidden sm:table-cell">
              24H CHANGE
            </TableHead>
            <TableHead className="text-[hsl(var(--primary))] hidden sm:table-cell text-center">
              NEWS
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activeCompanies.map((company) => (
            <TableRow
              key={company.id}
              className="border-[hsl(var(--primary)/0.3)] hover:bg-[hsl(var(--primary))/0.1] transition-colors"
            >
              <TableCell className="font-medium">
                {company.website ? (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-[hsl(var(--primary))] transition-colors"
                  >
                    <div className="w-[20px] h-[20px] relative flex-shrink-0">
                      <Image
                        src={company.logo}
                        alt={company.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    {company.name}
                    {isNew(company.createdAt) && (
                      <span className="ml-2 text-orange-500 text-[10px] font-bold uppercase tracking-wider align-middle">
                        New
                      </span>
                    )}
                  </a>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-[20px] h-[20px] relative flex-shrink-0">
                      <Image
                        src={company.logo}
                        alt={company.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    {company.name}
                    {isNew(company.createdAt) && (
                      <span className="ml-2 text-orange-500 text-[10px] font-bold uppercase tracking-wider align-middle">
                        New
                      </span>
                    )}
                  </div>
                )}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {company.category}
              </TableCell>
              <TableCell className="text-right">
                {company.reserve === 0 ? (
                  "-"
                ) : (
                  <>
                    {company.accountingType ===
                      AccountingType.SELF_REPORTED && (
                      <span className="mr-1 text-[hsl(var(--primary))]">*</span>
                    )}
                    {company.accountingType ===
                      AccountingType.PUBLIC_REPORT && (
                      <span className="mr-1 text-[hsl(var(--primary))]">
                        **
                      </span>
                    )}
                    <span>{company.reserve.toFixed(0).toLocaleString()}</span>
                    <span className="hidden sm:inline ml-1">ETH</span>
                  </>
                )}
              </TableCell>
              <TableCell className="hidden sm:table-cell text-center">
                <span
                  className={`inline-flex items-center text-xs font-medium rounded-full px-2 py-0.5 transition-all duration-300 ${
                    company.pctDiff === null || company.pctDiff === 0
                      ? "text-gray-400 bg-gray-400/10"
                      : company.pctDiff > 0
                        ? "text-emerald-500 bg-emerald-500/10"
                        : "text-rose-500 bg-rose-500/10"
                  }`}
                >
                  {company.pctDiff === null || company.pctDiff === 0 ? (
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 12h14"
                      ></path>
                    </svg>
                  ) : company.pctDiff > 0 ? (
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 15l7-7 7 7"
                      ></path>
                    </svg>
                  ) : (
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  )}
                  {company.pctDiff === null
                    ? "0.00"
                    : Math.abs(company.pctDiff).toFixed(2)}
                  %
                </span>
              </TableCell>
              <TableCell className="hidden sm:table-cell text-center">
                {company.news ? (
                  <a
                    href={company.news}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex justify-center text-[hsl(var(--primary))] hover:underline"
                  >
                    <Newspaper className="w-4 h-4" />
                  </a>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* Legend for Accounting Types */}
      <div className="p-4 text-xs text-muted-foreground border-t border-[hsl(var(--primary)/0.3)]">
        <p>
          <span className="font-bold text-[hsl(var(--primary))]">*</span> Amount
          self-reported by the entity.
        </p>
        <p>
          <span className="font-bold text-[hsl(var(--primary))]">**</span>{" "}
          Amount extracted from public filings or reports.
        </p>
      </div>
    </div>
  );
}
