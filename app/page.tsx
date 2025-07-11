"use client";

import CompanyTable from "@/components/CompanyTable";
import ETHReserveChart from "@/components/ETHReserveChart";
import CategoryReserveChart from "@/components/CategoryReserveChart";
import TotalReserveStats from "@/components/TotalReserveStats";
import { EthereumLogo } from "@/components/icons/EthereumLogo";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Company } from "./interfaces/interface";
import CircleLoader from "react-spinners/ClipLoader";
import { TOTAL_CIRCULATING_ETH_SUPPLY } from "@/lib/constants";

export default function Home() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ethPrice, setEthPrice] = useState<number>(0);
  const [showUSD, setShowUSD] = useState(true); // Light mode (USD/institutional) by default

  // Load saved preference from localStorage
  useEffect(() => {
    const savedPreference = localStorage.getItem("ser-theme-mode");
    if (savedPreference !== null) {
      setShowUSD(savedPreference === "light");
    }
  }, []);

  // Theme switching effect
  useEffect(() => {
    const body = document.body;
    if (showUSD) {
      body.classList.add("institutional");
    } else {
      body.classList.remove("institutional");
    }

    // Save preference to localStorage
    localStorage.setItem("ser-theme-mode", showUSD ? "light" : "dark");

    // Cleanup function to remove class when component unmounts
    return () => {
      body.classList.remove("institutional");
    };
  }, [showUSD]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [companiesRes] = await Promise.all([fetch(`/api/companies`)]);

        if (!companiesRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const companiesData = await companiesRes.json();

        setCompanies(companiesData.companies);
        setEthPrice(companiesData.lastETHPrice || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const totalReserve = companies
    .filter((company: Company) => company.status === "ACTIVE")
    .reduce((sum, company) => sum + company.reserve, 0);

  const totalReserveUSD = totalReserve * ethPrice;

  const activeCompanyCount = companies.filter(
    (company: Company) => company.status === "ACTIVE"
  ).length;

  const percentageOfCirculatingSupply =
    TOTAL_CIRCULATING_ETH_SUPPLY > 0
      ? (totalReserve / TOTAL_CIRCULATING_ETH_SUPPLY) * 100
      : 0;

  if (error) {
    return (
      <main
        className={`min-h-screen cyber-grid ${showUSD ? "institutional" : ""}`}
      >
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-red-500">Error: {error}</div>
        </div>
      </main>
    );
  }

  return (
    <main
      className={`min-h-screen cyber-grid ${showUSD ? "institutional" : ""}`}
    >
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center mb-8 relative">
          {/* Light/Dark Toggle - Top right */}
          <div className="absolute top-0 right-0">
            <div
              className={`bg-card/80 backdrop-blur-sm border border-[hsl(var(--primary))] rounded-lg p-1 neon-border ${showUSD ? "institutional-shadow-lg" : ""}`}
            >
              <div className="flex">
                <Button
                  variant={showUSD ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setShowUSD(true)}
                  className={`text-xs font-semibold px-3 py-1 ${
                    showUSD
                      ? "bg-[hsl(var(--primary))] text-white hover:!bg-[hsl(var(--primary))] hover:text-black"
                      : "text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))/0.1]"
                  }`}
                >
                  <Sun className="w-4 h-4" />
                </Button>
                <Button
                  variant={!showUSD ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setShowUSD(false)}
                  className={`text-xs font-semibold px-3 py-1 ${
                    !showUSD
                      ? "bg-[hsl(var(--primary))] text-black"
                      : "text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))/0.1]"
                  }`}
                >
                  <Moon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-center items-center mb-4">
            <div className="relative">
              <EthereumLogo className="w-20 h-20 text-[hsl(var(--primary))] animate-pulse" />
              <div className="absolute inset-0 bg-[hsl(var(--primary))] blur-xl opacity-20" />
            </div>
          </div>
          <div className="flex mx-auto mb-4 justify-center">
            <Image
              src={
                showUSD
                  ? "/images/strategicethreserve_inst.svg"
                  : "/images/strategicethreserve.svg"
              }
              alt="Strategic Ethereum Reserve"
              width={507}
              height={400}
            />
          </div>

          {/* Explanation Section */}
          <div className="mx-auto max-w-2xl mb-6 text-center relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--primary))/20] to-transparent"></div>
            <p className="text-sm text-muted-foreground pt-4 leading-relaxed tracking-wide">
              <span className="font-semibold text-[hsl(var(--primary))] drop-shadow-sm">
                ETH is set to become the world&apos;s #1 reserve asset
              </span>{" "}
              <br />
              <span className={showUSD ? "text-foreground" : "text-white"}>
                SER tracks entities accumulating ETH as a strategic reserve
                asset.
              </span>
            </p>
          </div>

          {!isLoading && (
            <div className="mt-8 mb-2 flex flex-col lg:flex-row gap-6 items-start justify-center">
              <div className="w-full lg:w-1/3">
                <TotalReserveStats
                  totalReserve={totalReserve}
                  totalReserveUSD={totalReserveUSD}
                  activeCompanyCount={activeCompanyCount}
                  percentageOfCirculatingSupply={percentageOfCirculatingSupply}
                  showUSD={showUSD}
                />
              </div>
              <div className="w-full lg:w-1/3">
                <ETHReserveChart
                  totalReserve={totalReserve}
                  totalReserveUSD={totalReserveUSD}
                  showUSD={showUSD}
                  ethPrice={ethPrice}
                />
              </div>
              <div className="w-full lg:w-1/3">
                <CategoryReserveChart
                  companies={companies}
                  showUSD={showUSD}
                  ethPrice={ethPrice}
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-12">
          {isLoading ? (
            <div className="text-center">
              <CircleLoader
                color="hsl(var(--primary))"
                size={80}
                speedMultiplier={0.5}
              />
            </div>
          ) : (
            <div className="w-full">
              <CompanyTable
                companies={companies}
                totalReserve={totalReserve}
                totalReserveUSD={totalReserveUSD}
                ethPrice={ethPrice}
                showUSD={showUSD}
              />
            </div>
          )}
        </div>
        <footer className="mt-12 text-center">
          <a
            href="https://x.com/fabdarice"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-4 py-2 rounded-lg backdrop-blur-sm  hover:bg-[hsl(var(--primary))/0.1] transition-colors"
          >
            <span className="text-[hsl(var(--primary))] neon-glow">
              built by
            </span>
            <span className="text-[hsl(var(--primary))] neon-glow">
              fabda.eth
            </span>
          </a>
        </footer>
      </div>
    </main>
  );
}
