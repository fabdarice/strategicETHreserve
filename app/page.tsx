"use client";

import CompanyTable from "@/components/CompanyTable";
import RecentPledges from "@/components/RecentPledges";
import InfluencerSection from "@/components/InfluencerSection";
import { EthereumLogo } from "@/components/icons/EthereumLogo";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Company, Influencer } from "./interfaces/interface";
import CircleLoader from "react-spinners/ClipLoader";
import { targetGoal } from "@/lib/constants";

export default function Home() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        setCompanies(companiesData);
        setInfluencers(influencersData);
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
    .reduce((sum, company) => sum + company.currentReserve, 0);

  const progressPercentage = Math.min((totalReserve / targetGoal) * 100, 100);

  const activeCompanyCount = companies.filter(
    (company: Company) => company.status === "ACTIVE"
  ).length;

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

                  {/* Progress Bar & Target */}
                  <div className="w-full max-w-xs mt-2">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[hsl(var(--primary))] transition-all duration-500 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <div className="mt-1 flex justify-between items-center text-xs">
                      <span className="">Michael Saylor&apos;s Target </span>
                      <span className="font-medium text-[hsl(var(--primary))] ">
                        {progressPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Active Companies Count */}
                  <div className="mt-2 text-xs flex items-center gap-1">
                    <span className="text-muted-foreground">
                      Active Participants:
                    </span>
                    <span className="font-medium text-[hsl(var(--primary))] ">
                      {activeCompanyCount}
                    </span>
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
