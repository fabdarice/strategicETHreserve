"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Image from "next/image";
import { Company } from "@/app/interfaces/interface";
import { EthereumLogo } from "@/components/icons/EthereumLogo";

interface MarketingModalProps {
  company: Company;
  children: React.ReactNode;
}

export function MarketingModal({ company, children }: MarketingModalProps) {
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
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 w-full max-w-2xl pl-24">
                {company.logo && (
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-card/80 backdrop-blur-sm border border-border/30 shadow-lg">
                    <Image
                      src={company.logo}
                      alt={`${company.name} logo`}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <h2 className="text-3xl font-bold text-foreground tracking-tight">
                    {company.name}
                  </h2>
                  <p className="text-xl font-medium text-muted-foreground">
                    Joins the{" "}
                    <span className="text-[hsl(var(--primary))] font-semibold">
                      Strategic ETH Reserve
                    </span>
                  </p>
                </div>
              </div>

              {/* Stats Section */}
              {company.currentReserve > 0 && (
                <div className="flex justify-center w-full max-w-2xl pl-24">
                  <div className="w-64 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/30">
                    <p className="text-sm uppercase tracking-wider text-muted-foreground mb-1">
                      Current Reserve
                    </p>
                    <p className="text-2xl font-bold text-[hsl(var(--primary))]">
                      {company.currentReserve.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      ETH
                    </p>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-border/30 w-full max-w-2xl">
                <p className="text-sm text-muted-foreground text-center">
                  Join the movement at StrategicETHReserve.xyz
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
