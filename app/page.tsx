"use client";

import CompanyTable from "@/components/CompanyTable";
import RecentPledges from "@/components/RecentPledges";
import InfluencerSection from "@/components/InfluencerSection";
import { EthereumLogo } from "@/components/icons/EthereumLogo";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Company, Influencer } from "./interfaces/interface";
import CircleLoader from "react-spinners/ClipLoader";
import { targetGoal, TOTAL_CIRCULATING_ETH_SUPPLY } from "@/lib/constants";

export default function Home() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ethPrice, setEthPrice] = useState<number>(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const [companiesRes, influencersRes] = await Promise.all([
          fetch(`/api/companies`),
          fetch(`/api/influencers`),
        ]);

        if (!companiesRes.ok || !influencersRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const [companiesData, influencersData] = await Promise.all([
          companiesRes.json(),
          influencersRes.json(),
        ]);

        setCompanies(companiesData.companies);
        setInfluencers(influencersData);
        setEthPrice(companiesData.lastETHPrice || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const recentPledges = companies
    .filter((company: Company) => company.status === "ACTIVE")
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 3);

  const totalReserve = companies
    .filter((company: Company) => company.status === "ACTIVE")
    .reduce((sum, company) => sum + company.reserve, 0);

  const totalReserveUSD = totalReserve * ethPrice;

  const progressPercentage = Math.min((totalReserve / targetGoal) * 100, 100);

  const activeCompanyCount = companies.filter(
    (company: Company) => company.status === "ACTIVE"
  ).length;

  const percentageOfCirculatingSupply =
    TOTAL_CIRCULATING_ETH_SUPPLY > 0
      ? (totalReserve / TOTAL_CIRCULATING_ETH_SUPPLY) * 100
      : 0;

  if (error) {
    return (
      <main className="min-h-screen cyber-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-red-500">Error: {error}</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen cyber-grid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center mb-8 relative">
          <div className="flex justify-center items-center mb-4">
            <div className="relative">
              <EthereumLogo className="w-20 h-20 text-[hsl(var(--primary))] animate-pulse" />
              <div className="absolute inset-0 bg-[hsl(var(--primary))] blur-xl opacity-20" />
            </div>
          </div>
          <div className="flex mx-auto mb-4 justify-center">
            <Image
              src="/images/strategicethreserve.svg"
              alt="Strategic Ethereum Reserve"
              width={507}
              height={400}
            />
          </div>

          {!isLoading && (
            <div className="mt-8 mb-2">
              <div className="inline-block p-6 rounded-2xl bg-card/80 backdrop-blur-sm border border-[hsl(var(--primary))] neon-border">
                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm uppercase tracking-wider">
                    Total Strategic ETH Reserve
                  </p>
                  <div className="flex items-center gap-2">
                    <EthereumLogo className="w-6 h-6 text-[hsl(var(--primary))]" />
                    <p className="text-3xl font-bold text-[hsl(var(--primary))] leading-none">
                      {totalReserve.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </p>
                  </div>

                  {/* USD Value Display */}
                  <div className="mt-0 flex items-center gap-2 bg-[hsl(var(--primary))/0.05] p-2 rounded-xl backdrop-blur-sm">
                    <p className="text-lg font-medium text-[hsl(var(--primary-foreground))] leading-none">
                      $
                      {totalReserveUSD.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </p>
                  </div>

                  {/* Combined Participants and Percentage of Circulating Supply */}
                  <div className="mt-3 text-xs flex items-center justify-center gap-3">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">
                        Participants:
                      </span>
                      <span className="font-medium text-[hsl(var(--primary))]">
                        {activeCompanyCount}
                      </span>
                    </div>
                    <span className="text-muted-foreground">|</span>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">
                        % of Supply:
                      </span>
                      <span className="font-medium text-[hsl(var(--primary))]">
                        {percentageOfCirculatingSupply.toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 4,
                            maximumFractionDigits: 4,
                          }
                        )}
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-12">
          {isLoading ? (
            <div className="text-center">
              <CircleLoader color="#00FFAA" size={80} speedMultiplier={0.5} />
            </div>
          ) : (
            <div className="flex flex-col gap-12 lg:flex-row">
              <CompanyTable companies={companies} />
              <RecentPledges pledges={recentPledges} />
            </div>
          )}
          {!isLoading && <InfluencerSection influencers={influencers} />}
        </div>
        <footer className="mt-24 text-center">
          <a
            href="https://x.com/fabdarice"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-card/80 backdrop-blur-sm  hover:bg-[hsl(var(--primary))/0.1] transition-colors"
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
