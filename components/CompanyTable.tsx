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
import { Share2 } from "lucide-react";
import { MarketingModal } from "@/components/MarketingModal";

// Tier system with minimal left accent styling
type ContributionTier = {
  name: string;
  minAmount: number;
  accentClass: string;
  textWeight: string;
};

const CONTRIBUTION_TIERS: ContributionTier[] = [
  {
    name: "6-digits",
    minAmount: 100000, // 6 digits
    accentClass: "border-l-4 border-l-yellow-500",
    textWeight: "font-bold",
  },
  {
    name: "5-digits",
    minAmount: 10000, // 5 digits
    accentClass: "border-l-4 border-l-blue-500",
    textWeight: "font-semibold",
  },
  {
    name: "4-digits",
    minAmount: 1000, // 4 digits
    accentClass: "border-l-4 border-l-emerald-500",
    textWeight: "font-medium",
  },
  {
    name: "3-digits",
    minAmount: 100, // 3 digits
    accentClass: "border-l-4 border-l-gray-400",
    textWeight: "font-normal",
  },
];

function getContributionTier(amount: number): ContributionTier {
  return (
    CONTRIBUTION_TIERS.find((tier) => amount >= tier.minAmount) ||
    CONTRIBUTION_TIERS[CONTRIBUTION_TIERS.length - 1]
  );
}

// Helper function to check if a date is within the last 7 days
const isNew = (date: Date): boolean => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return new Date(date) > sevenDaysAgo;
};

export default function CompanyTable({
  companies,
  totalReserve,
  totalReserveUSD,
}: {
  companies: Company[];
  totalReserve: number;
  totalReserveUSD: number;
}) {
  const activeCompanies = companies.filter(
    (company) => company.status === "ACTIVE"
  );

  // Sort companies by reserve amount in descending order (highest first)
  const sortedCompanies = activeCompanies.sort((a, b) => b.reserve - a.reserve);

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
            Entities holding &gt;100 ETH in their treasury
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

      {/* Tier Legend */}
      <div className="px-6 py-4 border-b border-[hsl(var(--primary)/0.3)]">
        <div className="flex flex-wrap gap-4 justify-center text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 border-l-4 border-l-yellow-500 bg-muted/30"></div>
            <span>6-digits (100,000+ ETH)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 border-l-4 border-l-blue-500 bg-muted/30"></div>
            <span>5-digits (10,000+ ETH)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 border-l-4 border-l-emerald-500 bg-muted/30"></div>
            <span>4-digits (1,000+ ETH)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 border-l-4 border-l-gray-400 bg-muted/30"></div>
            <span>3-digits (100+ ETH)</span>
          </div>
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
              30D CHANGE
            </TableHead>
            <TableHead className="text-[hsl(var(--primary))] hidden lg:table-cell text-center w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCompanies.map((company) => {
            const tier = getContributionTier(company.reserve);

            return (
              <TableRow
                key={company.id}
                className={`border-[hsl(var(--primary)/0.3)] hover:bg-[hsl(var(--primary))/0.1] transition-colors ${tier.accentClass}`}
              >
                <TableCell className="font-medium">
                  {company.website ? (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 hover:text-[hsl(var(--primary))] transition-colors ${
                        tier.name === "6-digits"
                          ? "text-yellow-500 hover:text-yellow-400"
                          : ""
                      }`}
                    >
                      <div className="w-[20px] h-[20px] relative flex-shrink-0">
                        <Image
                          src={company.logo}
                          alt={company.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span>{company.name}</span>
                      {isNew(company.createdAt) && (
                        <span className="ml-2 text-emerald-500 text-[10px] font-bold uppercase tracking-wider align-middle">
                          New
                        </span>
                      )}
                    </a>
                  ) : (
                    <div
                      className={`flex items-center gap-2 ${
                        tier.name === "6-digits" ? "text-yellow-500" : ""
                      }`}
                    >
                      <div className="w-[20px] h-[20px] relative flex-shrink-0">
                        <Image
                          src={company.logo}
                          alt={company.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span>{company.name}</span>
                      {isNew(company.createdAt) && (
                        <span className="ml-2 text-emerald-500 text-[10px] font-bold uppercase tracking-wider align-middle">
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
                        <span className="mr-1 text-[hsl(var(--primary))]">
                          *
                        </span>
                      )}
                      {company.accountingType ===
                        AccountingType.PUBLIC_REPORT && (
                        <span className="mr-1 text-[hsl(var(--primary))]">
                          **
                        </span>
                      )}
                      <span className={tier.textWeight}>
                        {company.reserve.toLocaleString(undefined, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </span>
                      <span className="hidden sm:inline ml-1">ETH</span>
                    </>
                  )}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-center">
                  <span
                    className={`inline-flex items-center text-xs font-medium rounded-full px-2 py-0.5 transition-all duration-300 ${
                      company.pctDiff === null || company.pctDiff === 0
                        ? "text-gray-400 bg-gray-400/10"
                        : company.pctDiff && company.pctDiff > 0
                          ? "text-emerald-500 bg-emerald-500/10"
                          : company.pctDiff && company.pctDiff < -0.01
                            ? "text-rose-500 bg-rose-500/10"
                            : "text-gray-400 bg-gray-400/10"
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
                    ) : company.pctDiff && company.pctDiff > 0 ? (
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
                    ) : company.pctDiff && company.pctDiff < -0.01 ? (
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
                          d="M5 12h14"
                        ></path>
                      </svg>
                    )}
                    {company.pctDiff === null
                      ? "0.00"
                      : Math.abs(company.pctDiff ?? 0).toFixed(2)}
                    %
                  </span>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-center">
                  <MarketingModal
                    company={company}
                    totalReserve={totalReserve}
                    totalReserveUSD={totalReserveUSD}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))/0.1]"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </MarketingModal>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Legend for Accounting Types */}
      <div className="px-4 pb-4 text-xs text-muted-foreground">
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
