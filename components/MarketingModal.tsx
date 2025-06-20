"use client";

import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Company } from "@/app/interfaces/interface";
import { EthereumLogo } from "@/components/icons/EthereumLogo";
import { targetGoal } from "@/lib/constants";

// Custom DialogContent without close button
const CustomDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      {/* No close button here */}
    </DialogPrimitive.Content>
  </DialogPortal>
));
CustomDialogContent.displayName = DialogPrimitive.Content.displayName;

interface MarketingModalProps {
  company: Company;
  children: React.ReactNode;
  totalReserve: number;
  totalReserveUSD: number;
}

// Define contribution tiers
type ContributionTier = {
  name: string;
  minAmount: number;
  colors: {
    gradient: string;
    radial: string;
    border: string;
    text: string;
    accent: string;
    background: string;
  };
  animation: string;
  badge?: string;
};

const CONTRIBUTION_TIERS: ContributionTier[] = [
  {
    name: "6-digits",
    minAmount: 100000, // 6 digits
    colors: {
      gradient: "from-yellow-500/20 via-yellow-400/15 to-orange-500/20",
      radial: "from-yellow-400/25 via-orange-400/15 to-transparent",
      border: "border-yellow-400/50 shadow-yellow-400/30",
      text: "text-yellow-400",
      accent: "bg-yellow-400/10",
      background:
        "bg-gradient-to-br from-yellow-500/5 via-orange-400/5 to-red-500/5",
    },
    animation: "",
    badge: "💎",
  },
  {
    name: "5-digits",
    minAmount: 10000, // 5 digits
    colors: {
      gradient: "from-blue-500/25 via-purple-400/20 to-indigo-500/25",
      radial: "from-blue-400/30 via-purple-400/20 to-cyan-400/15",
      border: "border-blue-400/60 shadow-blue-400/40 shadow-lg",
      text: "text-blue-300",
      accent: "bg-gradient-to-r from-blue-400/15 to-purple-400/15",
      background:
        "bg-gradient-to-br from-blue-500/8 via-purple-400/8 to-indigo-500/8",
    },
    animation: "",
    badge: "🏆",
  },
  {
    name: "4-digits",
    minAmount: 1000, // 4 digits
    colors: {
      gradient: "from-green-500/20 via-emerald-400/15 to-teal-500/20",
      radial: "from-green-400/25 via-emerald-400/15 to-transparent",
      border: "border-green-400/50 shadow-green-400/30",
      text: "text-green-400",
      accent: "bg-green-400/10",
      background:
        "bg-gradient-to-br from-green-500/5 via-emerald-400/5 to-teal-500/5",
    },
    animation: "animate-pulse",
    badge: "🥇",
  },
  {
    name: "3-digits",
    minAmount: 100, // 3 digits
    colors: {
      gradient: "from-background via-background/95 to-card",
      radial: "from-[hsl(var(--primary))/0.15] via-transparent to-transparent",
      border: "border-[hsl(var(--primary))] neon-border",
      text: "text-[hsl(var(--primary))]",
      accent: "bg-[hsl(var(--primary))/0.05]",
      background: "bg-card/80",
    },
    animation: "",
    badge: "🥈",
  },
];

function getContributionTier(amount: number): ContributionTier {
  return (
    CONTRIBUTION_TIERS.find((tier) => amount >= tier.minAmount) ||
    CONTRIBUTION_TIERS[CONTRIBUTION_TIERS.length - 1]
  );
}

export function MarketingModal({
  company,
  children,
  totalReserve,
  totalReserveUSD,
}: MarketingModalProps) {
  const newTotalReserve = totalReserve || 0;
  const safeReserveUSD = totalReserveUSD || 0;
  const tier = getContributionTier(company.reserve);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <CustomDialogContent className="max-w-3xl p-0 overflow-hidden border-none">
        <div className="relative">
          {/* Dynamic Background with tier-specific gradient overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${tier.colors.gradient} transition-all duration-1000`}
          />
          <div
            className={`absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${tier.colors.radial} transition-all duration-1000`}
          />

          {/* Floating Tier Label */}
          {tier.name !== "3-digits" && (
            <div className="absolute top-4 right-4 z-10 animate-fade-in">
              <div
                className={`px-4 py-2 text-sm font-bold rounded-full ${tier.colors.accent} ${tier.colors.text} border ${tier.colors.border} backdrop-blur-sm shadow-lg`}
              >
                <span className="mr-1">{tier.badge}</span>
                {tier.name.toUpperCase()}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="relative p-8 animate-fade-in-up">
            {/* Header Section */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4 animate-bounce-slow">
                <EthereumLogo
                  className={`w-20 h-20 ${tier.colors.text} ${tier.animation} transition-all duration-500`}
                />
                <div
                  className={`absolute inset-0 ${tier.colors.background} blur-2xl opacity-30`}
                />
                {tier.name === "6-digits" && (
                  <div className="absolute -top-2 -right-2 text-2xl animate-bounce">
                    {tier.badge}
                  </div>
                )}
              </div>
              <div className="w-full max-w-md animate-slide-in">
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
            <div className="flex flex-col gap-2 animate-slide-in-delayed">
              <div className="flex items-center justify-center gap-6 w-full max-w-3xl mx-auto">
                {company.logo && (
                  <div
                    className={`relative w-24 h-24 rounded-xl overflow-hidden ${tier.colors.background} backdrop-blur-sm ${tier.colors.border} shadow-lg flex-shrink-0 animate-scale-in transition-all duration-500 hover:scale-105`}
                  >
                    <Image
                      src={company.logo}
                      alt={`${company.name} logo`}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <h2
                    className={`text-3xl font-bold ${
                      tier.name === "6-digits"
                        ? "bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent animate-shimmer"
                        : tier.name === "5-digits"
                          ? "bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent animate-shimmer"
                          : "text-foreground"
                    } tracking-tight truncate transition-all duration-500`}
                  >
                    {company.name}
                  </h2>
                  <p
                    className={`text-xl font-medium ${
                      tier.name === "6-digits"
                        ? "text-yellow-300"
                        : tier.name === "5-digits"
                          ? "text-blue-200"
                          : "text-muted-foreground"
                    } animate-fade-in-delayed transition-all duration-500`}
                  >
                    Contributing{" "}
                    <span
                      className={`${tier.colors.text} font-semibold ${
                        tier.name === "6-digits"
                          ? "text-2xl"
                          : tier.name === "5-digits"
                            ? "text-xl"
                            : ""
                      } transition-all duration-500`}
                    >
                      {company.reserve.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}{" "}
                      ETH
                    </span>
                  </p>
                </div>
              </div>

              {/* Impact & Progress Section */}
              <div className="w-full max-w-xl mx-auto mt-8 flex flex-col items-center gap-8 animate-slide-up">
                {/* Total Reserve Block with tier-specific styling */}
                <div
                  className={`inline-block p-6 rounded-2xl ${tier.colors.background} backdrop-blur-sm border ${tier.colors.border} ${tier.name === "6-digits" ? "shadow-2xl shadow-yellow-400/20" : ""} transition-all duration-500 hover:scale-105`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-sm uppercase tracking-wider text-muted-foreground animate-fade-in">
                      Total Strategic ETH Reserve
                    </p>
                    <div className="flex items-center gap-2 animate-scale-in-delayed">
                      <EthereumLogo
                        className={`w-6 h-6 ${tier.colors.text} transition-all duration-500`}
                      />
                      <p
                        className={`text-3xl font-bold ${tier.colors.text} leading-none transition-all duration-500`}
                      >
                        {newTotalReserve.toLocaleString()}
                      </p>
                    </div>
                    {/* USD Value Display */}
                    <div
                      className={`mt-0 flex items-center gap-2 ${tier.colors.accent} p-2 rounded-xl backdrop-blur-sm animate-fade-in-delayed transition-all duration-500`}
                    >
                      <p
                        className={`text-lg font-medium ${tier.colors.text} leading-none`}
                      >
                        ${safeReserveUSD.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-border/30 w-full max-w-2xl mx-auto animate-fade-in-delayed">
                <p className="text-sm text-muted-foreground text-center">
                  Join the movement at{" "}
                  <a
                    href="https://StrategicETHReserve.xyz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`font-semibold ${tier.colors.text} hover:underline underline-offset-2 neon-text-primary shadow-primary/50 transition-all duration-300 hover:scale-105`}
                  >
                    StrategicETHReserve.xyz
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Custom CSS for animations */}
        <style jsx>{`
          @keyframes fade-in {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes slide-in {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes slide-up {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes scale-in {
            from {
              opacity: 0;
              transform: scale(0.8);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes bounce-slow {
            0%,
            20%,
            50%,
            80%,
            100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-10px);
            }
            60% {
              transform: translateY(-5px);
            }
          }

          @keyframes glow {
            0%,
            100% {
              box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
            }
            50% {
              box-shadow: 0 0 40px rgba(255, 215, 0, 0.6);
            }
          }

          @keyframes shimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }

          .animate-fade-in {
            animation: fade-in 0.8s ease-out;
          }

          .animate-fade-in-up {
            animation: fade-in-up 1s ease-out;
          }

          .animate-fade-in-delayed {
            animation: fade-in 1s ease-out 0.3s both;
          }

          .animate-slide-in {
            animation: slide-in 0.8s ease-out 0.2s both;
          }

          .animate-slide-in-delayed {
            animation: slide-in 1s ease-out 0.4s both;
          }

          .animate-slide-up {
            animation: slide-up 1s ease-out 0.6s both;
          }

          .animate-scale-in {
            animation: scale-in 0.8s ease-out 0.2s both;
          }

          .animate-scale-in-delayed {
            animation: scale-in 0.8s ease-out 0.4s both;
          }

          .animate-bounce-slow {
            animation: bounce-slow 3s infinite;
          }

          .animate-glow {
            animation: glow 2s ease-in-out infinite;
          }

          .animate-shimmer {
            background-size: 200% 100%;
            animation: shimmer 2s linear infinite;
          }
        `}</style>
      </CustomDialogContent>
    </Dialog>
  );
}
