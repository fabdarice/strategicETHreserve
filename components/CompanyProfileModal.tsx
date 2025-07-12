"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { AdminCompany } from "@/app/interfaces/interface";
import { EthereumLogo } from "@/components/icons/EthereumLogo";
import { TOTAL_CIRCULATING_ETH_SUPPLY } from "@/lib/constants";
import {
  X,
  Calendar,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

// Helper function to format numbers with B/M suffixes
const formatNumber = (num: number): string => {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1) + "B";
  } else if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + "M";
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + "K";
  } else {
    return num.toFixed(0);
  }
};

// Custom DialogContent with close button
const CustomDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-0 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));
CustomDialogContent.displayName = DialogPrimitive.Content.displayName;

interface Purchase {
  id: string;
  amount: number;
  totalCost: number;
  type: string;
  purchaseDate: string;
  createdAt: string;
}

interface CompanyProfileModalProps {
  company: AdminCompany;
  children: React.ReactNode;
  ethPrice?: number;
}

export function CompanyProfileModal({
  company,
  children,
  ethPrice = 0,
}: CompanyProfileModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentPurchases, setRecentPurchases] = useState<Purchase[]>([]);
  const [totalYields, setTotalYields] = useState<number>(0);

  // Fetch recent purchases and ETH price when modal opens
  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, company.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get admin token for authentication
      const adminToken = localStorage.getItem("admin_token");
      if (!adminToken) {
        console.warn("No admin token found - skipping purchase data fetch");
        setLoading(false);
        return;
      }

      // Fetch recent purchases
      const purchasesResponse = await fetch(
        `/api/purchases?companyId=${company.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      if (purchasesResponse.ok) {
        const purchasesData = await purchasesResponse.json();
        const allPurchases = purchasesData.purchases || [];
        setRecentPurchases(allPurchases.slice(0, 3));

        // Calculate total yields
        const yields = allPurchases.filter((p: Purchase) => p.type === "yield");
        const totalYieldAmount = yields.reduce(
          (sum: number, p: Purchase) => sum + p.amount,
          0
        );
        setTotalYields(totalYieldAmount);
      } else if (
        purchasesResponse.status === 401 ||
        purchasesResponse.status === 403
      ) {
        console.warn("Unauthorized access to purchase data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if a company is a treasury company - exactly like CompanyTable.tsx
  const isTreasuryCompany = (company: AdminCompany): boolean => {
    return (
      company.category === "Treasuries" ||
      (Array.isArray(company.secondaryCategory) &&
        company.secondaryCategory.includes("Treasuries"))
    );
  };

  // Calculate derived values
  const ethReserve = company.reserve || 0;
  const currentUSDValue = ethReserve * ethPrice;
  const ethSupplyPercentage = (ethReserve / TOTAL_CIRCULATING_ETH_SUPPLY) * 100;
  const ethPerShare =
    company.sharesOutstanding && company.sharesOutstanding > 0
      ? ethReserve / company.sharesOutstanding
      : null;

  // P&L will be calculated inline like CompanyTable.tsx

  const nav = company.marketCap || null;
  const mNav =
    company.marketCap && ethReserve > 0
      ? company.marketCap / (ethPrice * ethReserve)
      : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <CustomDialogContent className="max-w-3xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-none shadow-2xl">
        <div className="relative">
          {/* Background with gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white/90 to-purple-50/80 dark:from-slate-900/80 dark:via-slate-800/90 dark:to-slate-900/80" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1)_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.2)_0%,transparent_50%)]" />

          {loading ? (
            <div className="p-12 flex flex-col justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-xl text-slate-600 dark:text-slate-300">
                Loading company profile...
              </p>
            </div>
          ) : (
            <div className="relative p-6 space-y-6">
              {/* Header Section - Simplified */}
              <div className="flex items-center gap-6 pb-4 border-b border-slate-200/50 dark:border-slate-700/50">
                {company.logo && (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white/90 dark:bg-slate-800/90 p-2">
                    <Image
                      src={company.logo}
                      alt={`${company.name} logo`}
                      fill
                      className="object-contain"
                      quality={100}
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    {company.name}
                  </h1>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    {company.ticker && (
                      <span className="font-mono font-semibold px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">
                        ${company.ticker}
                      </span>
                    )}
                    {company.twitter && (
                      <a
                        href={company.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-500 hover:text-blue-600 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        <span>
                          @{company.twitter.split("/").pop()?.replace("@", "")}
                        </span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Primary Highlighted Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* ETH Reserve with Yields */}
                <div className="rounded-xl p-4 border bg-gradient-to-br from-blue-50/90 to-blue-100/90 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200/50 dark:border-blue-700/50 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500 shadow-sm">
                        <EthereumLogo className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                          ETH Reserve
                        </h3>
                        {totalYields > 0 && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                            +{formatNumber(totalYields)} ETH (Yields)
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-blue-600 tabular-nums">
                        {formatNumber(ethReserve)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Unrealized P&L */}
                {isTreasuryCompany(company) &&
                company.totalCostAccumulated !== null ? (
                  <div
                    className={`rounded-xl p-4 border shadow-sm hover:shadow-md transition-all duration-200 ${ethPrice * company.reserve - (company.totalCostAccumulated || 0) >= 0 ? "bg-gradient-to-br from-green-50/90 to-green-100/90 dark:from-green-900/30 dark:to-green-800/30 border-green-200/50 dark:border-green-700/50" : "bg-gradient-to-br from-red-50/90 to-red-100/90 dark:from-red-900/30 dark:to-red-800/30 border-red-200/50 dark:border-red-700/50"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg shadow-sm ${ethPrice * company.reserve - (company.totalCostAccumulated || 0) >= 0 ? "bg-green-500" : "bg-red-500"}`}
                        >
                          {ethPrice * company.reserve -
                            (company.totalCostAccumulated || 0) >=
                          0 ? (
                            <ArrowUpRight className="w-5 h-5 text-white" />
                          ) : (
                            <ArrowDownRight className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                            Unrealized P&L
                          </h3>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-3xl font-bold tabular-nums ${ethPrice * company.reserve - (company.totalCostAccumulated || 0) >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          $
                          {formatNumber(
                            ethPrice * company.reserve -
                              (company.totalCostAccumulated || 0)
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl p-4 border bg-gradient-to-br from-slate-50/90 to-slate-100/90 dark:from-slate-800/30 dark:to-slate-700/30 border-slate-200/50 dark:border-slate-600/50 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-400 shadow-sm">
                          <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                            Unrealized P&L
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            Not a treasury entity
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-medium text-slate-500 dark:text-slate-400">
                          N/A
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Secondary Metrics Grid */}
              <div className="grid grid-cols-4 gap-2">
                {/* USD Value */}
                <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-lg p-3 border border-slate-200/40 dark:border-slate-700/40 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <h3 className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      USD Value
                    </h3>
                  </div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                    ${formatNumber(currentUSDValue)}
                  </p>
                </div>

                {/* Market Cap */}
                <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-lg p-3 border border-slate-200/40 dark:border-slate-700/40 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Market Cap
                    </h3>
                  </div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                    {nav ? `$${formatNumber(nav)}` : "N/A"}
                  </p>
                </div>

                {/* mNAV */}
                <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-lg p-3 border border-slate-200/40 dark:border-slate-700/40 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-amber-600" />
                    <h3 className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      mNAV
                    </h3>
                  </div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                    {mNav !== null ? mNav.toFixed(2) : "N/A"}
                  </p>
                </div>

                {/* ETH per Share */}
                <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-lg p-3 border border-slate-200/40 dark:border-slate-700/40 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <EthereumLogo className="w-4 h-4 text-purple-600" />
                    <h3 className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      ETH/Share
                    </h3>
                  </div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                    {ethPerShare !== null ? ethPerShare.toFixed(4) : "N/A"}
                  </p>
                </div>
              </div>

              {/* Strategic ETH Reserve logo at bottom center */}
              <div className="pt-4 pb-2 flex justify-center">
                <a
                  href="https://StrategicETHReserve.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-all duration-300 hover:scale-105"
                >
                  <Image
                    src="/images/strategicethreservexyz_light.svg"
                    alt="Strategic ETH Reserve"
                    width={200}
                    height={40}
                    className="h-auto opacity-60 hover:opacity-80"
                  />
                </a>
              </div>
            </div>
          )}
        </div>
      </CustomDialogContent>
    </Dialog>
  );
}
