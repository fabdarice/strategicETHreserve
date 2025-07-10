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
import {
  Company,
  AccountingType,
  CompanyStatus,
} from "@/app/interfaces/interface";
import { ChevronUp, ChevronDown, Filter, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";

// Sorting types
type SortField = "name" | "reserve" | "reserveUSD" | "pctDiff" | "rank";
type SortDirection = "asc" | "desc";

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
  ethPrice,
  showUSD,
}: {
  companies: Company[];
  totalReserve: number;
  totalReserveUSD: number;
  ethPrice: number;
  showUSD: boolean;
}) {
  // Sorting state
  const [sortField, setSortField] = useState<SortField>("reserve");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Filter state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const mobileFilterRef = useRef<HTMLDivElement>(null);

  const activeCompanies = companies.filter(
    (company) => company.status === "ACTIVE" || company.status === "PENDING"
  );

  // Get unique categories from active companies
  const availableCategories = Array.from(
    new Set([
      ...activeCompanies.map((company) => company.category),
      ...activeCompanies
        .flatMap((company) =>
          Array.isArray(company.secondaryCategory)
            ? company.secondaryCategory
            : company.secondaryCategory
              ? [company.secondaryCategory]
              : []
        )
        .filter((cat) => cat !== ""),
    ])
  ).sort();

  // Filter companies by selected categories (include both primary and secondary)
  const filteredCompanies =
    selectedCategories.length > 0
      ? activeCompanies.filter((company) => {
          // Check if primary category matches
          if (selectedCategories.includes(company.category)) {
            return true;
          }

          // Check if any secondary category matches
          const secondaryCategories = Array.isArray(company.secondaryCategory)
            ? company.secondaryCategory
            : company.secondaryCategory
              ? [company.secondaryCategory]
              : [];

          return secondaryCategories.some((cat) =>
            selectedCategories.includes(cat)
          );
        })
      : activeCompanies;

  // Toggle category selection
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories([]);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Check if click is outside both desktop and mobile filter areas
      const isOutsideDesktop =
        !filterRef.current || !filterRef.current.contains(target);
      const isOutsideMobile =
        !mobileFilterRef.current || !mobileFilterRef.current.contains(target);

      if (isOutsideDesktop && isOutsideMobile) {
        setShowCategoryFilter(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sorting function
  const sortCompanies = (companies: Company[]) => {
    return [...companies].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "reserve":
          aValue = a.reserve;
          bValue = b.reserve;
          break;
        case "reserveUSD":
          aValue = a.reserve * ethPrice;
          bValue = b.reserve * ethPrice;
          break;
        case "rank":
          // For rank, we sort by reserve but flip the direction
          // asc rank order (1,2,3...) needs desc reserve order (highest first)
          aValue = a.reserve;
          bValue = b.reserve;
          // Flip the comparison for rank
          if (sortDirection === "asc") {
            return bValue - aValue; // highest reserves first (rank 1, 2, 3...)
          } else {
            return aValue - bValue; // lowest reserves first (highest rank numbers first)
          }
        case "pctDiff":
          // Handle null values - put them at the end
          aValue = a.pctDiff ?? -Infinity;
          bValue = b.pctDiff ?? -Infinity;
          break;
        default:
          return 0;
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  };

  // Handle header click
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection(
        field === "reserve" || field === "reserveUSD" || field === "pctDiff"
          ? "desc"
          : "asc"
      );
    }
  };

  // Get sort icon
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return null;
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4 ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 ml-1" />
    );
  };

  const sortedCompanies = sortCompanies(filteredCompanies);

  return (
    <div className="rounded-lg border border-[hsl(var(--primary))] bg-card/80 backdrop-blur-sm neon-border overflow-hidden flex-1 institutional-shadow-lg">
      <div className="p-6 md:flex md:justify-between gap-2">
        <div>
          <Image
            src={
              showUSD
                ? "/images/strategicethreservexyz_light.svg"
                : "/images/strategicethreservexyz_dark.svg"
            }
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
              className="bg-[hsl(var(--primary))] text-secondary hover:bg-[hsl(var(--primary-foreground))] neon-border join-movement-btn"
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

      {/* Category Filter */}
      <div className="px-6 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {filteredCompanies.length} of {activeCompanies.length} entities
            </span>

            {/* Desktop filter layout - next to entity count */}
            <div className="hidden sm:flex items-center gap-2 flex-wrap">
              <div className="relative" ref={filterRef}>
                <button
                  onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                  className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded border transition-colors ${
                    selectedCategories.length > 0
                      ? "bg-[hsl(var(--primary))] text-secondary border-[hsl(var(--primary))]"
                      : "bg-background text-muted-foreground border-[hsl(var(--primary)/0.3)] hover:bg-[hsl(var(--primary)/0.1)] hover:text-[hsl(var(--primary))]"
                  }`}
                >
                  <Filter className="w-3 h-3" />
                  <span>
                    {selectedCategories.length > 0
                      ? `${selectedCategories.length}`
                      : "Filter"}
                  </span>
                </button>

                {showCategoryFilter && (
                  <div className="absolute top-full left-0 mt-1 bg-card border border-[hsl(var(--primary)/0.3)] rounded-lg shadow-lg z-50 w-96 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-[hsl(var(--primary))]">
                        Filter by Category
                      </span>
                      {selectedCategories.length > 0 && (
                        <button
                          onClick={clearFilters}
                          className="text-xs text-muted-foreground hover:text-[hsl(var(--primary))] transition-colors flex items-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {availableCategories.map((category) => {
                        const isSelected =
                          selectedCategories.includes(category);
                        const count = activeCompanies.filter((c) => {
                          // Count if primary category matches
                          if (c.category === category) {
                            return true;
                          }

                          // Count if any secondary category matches
                          const secondaryCategories = Array.isArray(
                            c.secondaryCategory
                          )
                            ? c.secondaryCategory
                            : c.secondaryCategory
                              ? [c.secondaryCategory]
                              : [];

                          return secondaryCategories.includes(category);
                        }).length;

                        return (
                          <button
                            key={category}
                            onClick={() => toggleCategory(category)}
                            className={`w-full text-left px-2 py-1.5 rounded text-xs transition-all duration-200 flex items-center justify-between ${
                              isSelected
                                ? "bg-[hsl(var(--primary))] text-secondary"
                                : "hover:bg-[hsl(var(--primary)/0.1)] hover:text-[hsl(var(--primary))]"
                            }`}
                          >
                            <span className="truncate">{category}</span>
                            <span className="text-xs opacity-70 ml-1">
                              ({count})
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop Category Chips */}
              {selectedCategories.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {selectedCategories.map((category) => (
                    <span
                      key={category}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-[hsl(var(--primary)/0.2)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.3)] hover:bg-[hsl(var(--primary)/0.3)] transition-colors"
                    >
                      {category}
                      <button
                        onClick={() => toggleCategory(category)}
                        className="ml-1 hover:text-[hsl(var(--primary-foreground))] transition-colors"
                        aria-label={`Remove ${category} filter`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile filter layout - inline with selected categories */}
            <div className="sm:hidden flex items-center gap-2 flex-wrap">
              <div className="relative" ref={mobileFilterRef}>
                <button
                  onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                  className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded border transition-colors ${
                    selectedCategories.length > 0
                      ? "bg-[hsl(var(--primary))] text-secondary border-[hsl(var(--primary))]"
                      : "bg-background text-muted-foreground border-[hsl(var(--primary)/0.3)] hover:bg-[hsl(var(--primary)/0.1)] hover:text-[hsl(var(--primary))]"
                  }`}
                >
                  <Filter className="w-3 h-3" />
                  <span>
                    {selectedCategories.length > 0
                      ? `${selectedCategories.length}`
                      : "Filter"}
                  </span>
                </button>

                {showCategoryFilter && (
                  <div className="absolute top-full left-0 mt-1 bg-card border border-[hsl(var(--primary)/0.3)] rounded-lg shadow-lg z-50 w-[calc(100vw-3rem)] max-w-96 p-3 right-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-[hsl(var(--primary))]">
                        Filter by Category
                      </span>
                      {selectedCategories.length > 0 && (
                        <button
                          onClick={clearFilters}
                          className="text-xs text-muted-foreground hover:text-[hsl(var(--primary))] transition-colors flex items-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      {availableCategories.map((category) => {
                        const isSelected =
                          selectedCategories.includes(category);
                        const count = activeCompanies.filter((c) => {
                          // Count if primary category matches
                          if (c.category === category) {
                            return true;
                          }

                          // Count if any secondary category matches
                          const secondaryCategories = Array.isArray(
                            c.secondaryCategory
                          )
                            ? c.secondaryCategory
                            : c.secondaryCategory
                              ? [c.secondaryCategory]
                              : [];

                          return secondaryCategories.includes(category);
                        }).length;

                        return (
                          <button
                            key={category}
                            onClick={() => toggleCategory(category)}
                            className={`w-full text-left px-2 py-1.5 rounded text-xs transition-all duration-200 flex items-center justify-between ${
                              isSelected
                                ? "bg-[hsl(var(--primary))] text-secondary"
                                : "hover:bg-[hsl(var(--primary)/0.1)] hover:text-[hsl(var(--primary))]"
                            }`}
                          >
                            <span className="truncate">{category}</span>
                            <span className="text-xs opacity-70 ml-1">
                              ({count})
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Category Chips - inline with filter button */}
              {selectedCategories.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {selectedCategories.map((category) => (
                    <span
                      key={category}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-[hsl(var(--primary)/0.2)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.3)] hover:bg-[hsl(var(--primary)/0.3)] transition-colors"
                    >
                      {category}
                      <button
                        onClick={() => toggleCategory(category)}
                        className="ml-1 hover:text-[hsl(var(--primary-foreground))] transition-colors"
                        aria-label={`Remove ${category} filter`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow
            className={`border-[hsl(var(--primary)/0.3)] ${showUSD ? "bg-gradient-to-r from-slate-50 via-white to-slate-50 shadow-sm" : ""}`}
          >
            <TableHead
              className={`text-[hsl(var(--primary))] text-center w-16 cursor-pointer hover:text-[hsl(var(--primary-foreground))] transition-all duration-200 select-none hidden sm:table-cell ${showUSD ? "bg-gradient-to-b from-white/80 to-slate-100/60 backdrop-blur-sm border-r border-slate-200/50 font-semibold tracking-wide" : ""}`}
              onClick={() => handleSort("rank")}
            >
              <div className="flex items-center justify-center">
                #{getSortIcon("rank")}
              </div>
            </TableHead>
            <TableHead
              className={`text-[hsl(var(--primary))] cursor-pointer hover:text-[hsl(var(--primary-foreground))] transition-all duration-200 select-none ${showUSD ? "bg-gradient-to-b from-white/80 to-slate-100/60 backdrop-blur-sm border-r border-slate-200/50 font-semibold tracking-wide" : ""}`}
              onClick={() => handleSort("name")}
            >
              <div className="flex items-center">
                ENTITIES
                {getSortIcon("name")}
              </div>
            </TableHead>
            <TableHead
              className={`text-[hsl(var(--primary))] hidden sm:table-cell text-center ${showUSD ? "bg-gradient-to-b from-white/80 to-slate-100/60 backdrop-blur-sm border-r border-slate-200/50 font-semibold tracking-wide" : ""}`}
            >
              TICKER
            </TableHead>
            <TableHead
              className={`text-right text-[hsl(var(--primary))] cursor-pointer hover:text-[hsl(var(--primary-foreground))] transition-all duration-200 select-none ${showUSD ? "bg-gradient-to-b from-white/80 to-slate-100/60 backdrop-blur-sm border-r border-slate-200/50 font-semibold tracking-wide" : ""}`}
              onClick={() => handleSort("reserve")}
            >
              <div className="flex items-center justify-end">
                <div className="flex items-center gap-2">
                  ETH
                  {getSortIcon("reserve")}
                </div>
              </div>
            </TableHead>
            <TableHead
              className={`text-right text-[hsl(var(--primary))] cursor-pointer hover:text-[hsl(var(--primary-foreground))] transition-all duration-200 select-none hidden sm:table-cell ${showUSD ? "bg-gradient-to-b from-white/80 to-slate-100/60 backdrop-blur-sm border-r border-slate-200/50 font-semibold tracking-wide" : ""}`}
              onClick={() => handleSort("reserveUSD")}
            >
              <div className="flex items-center justify-end">
                <div className="flex items-center gap-2">
                  USD
                  {getSortIcon("reserveUSD")}
                </div>
              </div>
            </TableHead>
            <TableHead
              className={`text-center text-[hsl(var(--primary))] hidden sm:table-cell cursor-pointer hover:text-[hsl(var(--primary-foreground))] transition-all duration-200 select-none ${showUSD ? "bg-gradient-to-b from-white/80 to-slate-100/60 backdrop-blur-sm font-semibold tracking-wide" : ""}`}
              onClick={() => handleSort("pctDiff")}
            >
              <div className="flex items-center justify-center">
                30 DAYS
                {getSortIcon("pctDiff")}
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCompanies.map((company, index) => {
            const tier = getContributionTier(company.reserve);
            const usdValue = company.reserve * ethPrice;

            // Calculate rank based on reserve amount (always use ETH, not USD)
            // Create a sorted list by reserve to get the true rank
            const rankedCompanies = [...filteredCompanies].sort(
              (a, b) => b.reserve - a.reserve
            );
            const rank =
              rankedCompanies.findIndex((c) => c.id === company.id) + 1;

            return (
              <TableRow
                key={company.id}
                className={`border-[hsl(var(--primary)/0.3)] hover:bg-[hsl(var(--primary))/0.1] transition-colors h-8`}
              >
                <TableCell className="text-center py-1 font-medium hidden sm:table-cell">
                  {rank}
                </TableCell>
                <TableCell className="font-medium py-1">
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
                      <span>{company.name}</span>
                      {company.accountingType ===
                        AccountingType.SELF_REPORTED && (
                        <span className="text-[hsl(var(--primary))] text-xs">
                          *
                        </span>
                      )}
                      {company.accountingType ===
                        AccountingType.PUBLIC_REPORT && (
                        <span className="text-[hsl(var(--primary))] text-xs">
                          **
                        </span>
                      )}
                      {isNew(company.createdAt) && (
                        <span className="ml-2 text-emerald-500 text-[10px] font-bold uppercase tracking-wider align-middle">
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
                      <span>{company.name}</span>
                      {company.accountingType ===
                        AccountingType.SELF_REPORTED && (
                        <span className="text-[hsl(var(--primary))] text-xs">
                          *
                        </span>
                      )}
                      {company.accountingType ===
                        AccountingType.PUBLIC_REPORT && (
                        <span className="text-[hsl(var(--primary))] text-xs">
                          **
                        </span>
                      )}
                      {isNew(company.createdAt) && (
                        <span className="ml-2 text-emerald-500 text-[10px] font-bold uppercase tracking-wider align-middle">
                          New
                        </span>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell className="hidden sm:table-cell py-1 text-center">
                  {company.ticker || "-"}
                </TableCell>
                <TableCell className="text-right py-1">
                  {company.status === CompanyStatus.PENDING ? (
                    "Pending"
                  ) : company.reserve === 0 ? (
                    "-"
                  ) : (
                    <span className="font-medium tabular-nums">
                      {company.reserve.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right py-1 hidden sm:table-cell">
                  {company.status === CompanyStatus.PENDING ? (
                    "Pending"
                  ) : company.reserve === 0 ? (
                    "-"
                  ) : (
                    <span className="font-medium tabular-nums secondary-value-text">
                      $
                      {usdValue.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  )}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-center py-2">
                  <span
                    className={`inline-flex items-center text-xs font-medium rounded-full px-2 py-0.5 transition-all duration-300 tabular-nums ${
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
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Legend for Accounting Types */}
      <div className="px-4 pb-4 pt-4 text-xs text-muted-foreground">
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
