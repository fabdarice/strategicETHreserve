"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Image from "next/image";
import { Company } from "@/app/interfaces/interface";
import { EthereumLogo } from "@/components/icons/EthereumLogo";
import { targetGoal } from "@/lib/constants";

interface MarketingModalProps {
  company: Company;
  children: React.ReactNode;
  totalReserve: number;
  totalReserveUSD: number;
}

export function MarketingModal({
  company,
  children,
  totalReserve,
  totalReserveUSD,
}: MarketingModalProps) {
  // const oldReserve = totalReserve - company.currentReserve;
  const newTotalReserve = totalReserve;
  // const remainingToTarget = Math.max(0, targetGoal - newTotalReserve);
  // const oldProgressPercentage = Math.min((oldReserve / targetGoal) * 100, 100);
  const newProgressPercentage = Math.min(
    (newTotalReserve / targetGoal) * 100,
    100
  );

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl p-0 overflow-hidden border-none">
        <div className="relative">
          {/* Background with gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-card" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[hsl(var(--primary))/0.15] via-transparent to-transparent" />

          {/* Content */}
          <div className="relative p-8">
            {/* Header Section */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4">
                <EthereumLogo className="w-20 h-20 text-[hsl(var(--primary))] animate-pulse" />
                <div className="absolute inset-0 bg-[hsl(var(--primary))] blur-2xl opacity-30" />
              </div>
              <div className="w-full max-w-md">
                <Image
                  src="/images/strategicethreserve.svg"
                  alt="Strategic Ethereum Reserve"
                  width={507}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
            </div>

            {/* Company Section */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-center gap-6 w-full max-w-3xl mx-auto">
                {company.logo && (
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-card/80 backdrop-blur-sm border border-border/30 shadow-lg flex-shrink-0">
                    <Image
                      src={company.logo}
                      alt={`${company.name} logo`}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <h2 className="text-3xl font-bold text-foreground tracking-tight truncate">
                    {company.name}
                  </h2>
                  <p className="text-xl font-medium text-muted-foreground">
                    Contributing{" "}
                    <span className="text-foreground font-semibold">
                      {company.reserve.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}{" "}
                      ETH
                    </span>
                  </p>
                </div>
              </div>

              {/* Impact & Progress Section - Reverted to Homepage Style */}
              <div className="w-full max-w-xl mx-auto mt-8 flex flex-col items-center gap-8">
                {/* Homepage Total Reserve Block */}
                <div className="inline-block p-6 rounded-2xl bg-card/80 backdrop-blur-sm border border-[hsl(var(--primary))] neon-border">
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-sm uppercase tracking-wider text-muted-foreground">
                      Total Strategic ETH Reserve
                    </p>
                    <div className="flex items-center gap-2">
                      <EthereumLogo className="w-6 h-6 text-[hsl(var(--primary))]" />
                      <p className="text-3xl font-bold text-[hsl(var(--primary))] leading-none">
                        {newTotalReserve.toLocaleString(undefined, {
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
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-border/30 w-full max-w-2xl mx-auto">
                <p className="text-sm text-muted-foreground text-center">
                  Join the movement at{" "}
                  <a
                    href="https://StrategicETHReserve.xyz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[hsl(var(--primary))] hover:underline underline-offset-2 neon-text-primary shadow-primary/50"
                  >
                    StrategicETHReserve.xyz
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
