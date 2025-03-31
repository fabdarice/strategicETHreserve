"use client";

import CompanyTable from "@/components/CompanyTable";
import RecentPledges from "@/components/RecentPledges";
import InfluencerSection from "@/components/InfluencerSection";
import { EthereumLogo } from "@/components/icons/EthereumLogo";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Company, Influencer } from "./interfaces/interface";

export default function Home() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [companiesRes, influencersRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/companies`),
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/influencers`),
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
    .filter((company: Company) => company.status == "ACTIVE")
    .slice(0, 3);

  if (isLoading) {
    return (
      <main className="min-h-screen cyber-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">Loading...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen cyber-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-red-500">Error: {error}</div>
        </div>
      </main>
    );
  }

  console.log({ companies, influencers });

  return (
    <main className="min-h-screen cyber-grid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center mb-10 relative">
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
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto backdrop-blur-sm bg-background/50 p-4 rounded-lg">
            &ldquo;Ethereum security is a shared responsibility.&rdquo; - Justin
            Drake
          </p>
        </div>

        <div className="space-y-16">
          <div className="flex flex-col gap-12 lg:flex-row">
            <CompanyTable companies={companies} />
            <RecentPledges pledges={recentPledges} />
          </div>
          <InfluencerSection influencers={influencers} />
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
