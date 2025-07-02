"use client";

import { Company } from "@/app/interfaces/interface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { EthereumLogo } from "@/components/icons/EthereumLogo";

// Tier system with minimal left accent styling (same as CompanyTable)
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
    accentClass: "border-l-3 border-l-slate-400",
    textWeight: "font-normal",
  },
];

function getContributionTier(amount: number): ContributionTier {
  return (
    CONTRIBUTION_TIERS.find((tier) => amount >= tier.minAmount) ||
    CONTRIBUTION_TIERS[CONTRIBUTION_TIERS.length - 1]
  );
}

export default function RecentPledges({
  pledges,
  showUSD,
  ethPrice,
}: {
  pledges: Company[];
  showUSD: boolean;
  ethPrice: number;
}) {
  return (
    <section className="space-y-6 md:w-80 flex-shrink-0">
      <div>
        <Image
          src="/images/recentpledges.svg"
          alt="Ethereum Champions"
          width={200}
          height={30}
          className="mb-2"
        />
        <p className="text-sm">Latest entities joining the SER movement</p>
      </div>
      <div className="grid gap-3 grid-cols-1">
        {pledges.map((pledge) => {
          const tier = getContributionTier(pledge.reserve);

          return (
            <Card
              key={pledge.id}
              className={`border-[hsl(var(--primary))] bg-card/80 backdrop-blur-sm neon-border ${tier.accentClass} ${
                pledge.website
                  ? "cursor-pointer hover:bg-[hsl(var(--primary))/0.1] transition-colors"
                  : ""
              }`}
              onClick={() => {
                if (pledge.website) {
                  window.open(pledge.website, "_blank", "noopener,noreferrer");
                }
              }}
            >
              <CardHeader>
                <CardTitle
                  className={`text-[hsl(var(--primary))] flex items-center gap-2 ${
                    tier.name === "6-digits" ? "text-yellow-500" : ""
                  }`}
                >
                  <Image
                    src={pledge.logo}
                    alt={`${pledge.name} logo`}
                    width={24}
                    height={24}
                    className="rounded-sm"
                  />
                  {pledge.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    {pledge.category}
                  </div>
                  {pledge.reserve > 0 && (
                    <div
                      className={`text-[hsl(var(--primary))] ${tier.textWeight} flex items-center gap-1`}
                    >
                      {!showUSD && <EthereumLogo className="w-4 h-4" />}
                      {showUSD && "$"}
                      {(showUSD
                        ? pledge.reserve * ethPrice
                        : pledge.reserve
                      ).toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: showUSD ? 0 : 0,
                      })}
                      {!showUSD && " ETH"}
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    Joined{" "}
                    {formatDistanceToNow(new Date(pledge.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
