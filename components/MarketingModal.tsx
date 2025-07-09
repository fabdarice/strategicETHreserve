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
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";

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
      gradient: "from-background via-background/95 to-card",
      radial: "from-[hsl(var(--primary))/0.15] via-transparent to-transparent",
      border: "border-[hsl(var(--primary))] neon-border",
      text: "text-[hsl(var(--primary))]",
      accent: "bg-[hsl(var(--primary))/0.05]",
      background: "bg-card/80",
    },
    animation: "",
    badge: "💎",
  },
  {
    name: "5-digits",
    minAmount: 10000, // 5 digits
    colors: {
      gradient: "from-background via-background/95 to-card",
      radial: "from-[hsl(var(--primary))/0.15] via-transparent to-transparent",
      border: "border-[hsl(var(--primary))] neon-border",
      text: "text-[hsl(var(--primary))]",
      accent: "bg-[hsl(var(--primary))/0.05]",
      background: "bg-card/80",
    },
    animation: "",
    badge: "🏆",
  },
  {
    name: "4-digits",
    minAmount: 1000, // 4 digits
    colors: {
      gradient: "from-background via-background/95 to-card",
      radial: "from-[hsl(var(--primary))/0.15] via-transparent to-transparent",
      border: "border-[hsl(var(--primary))] neon-border",
      text: "text-[hsl(var(--primary))]",
      accent: "bg-[hsl(var(--primary))/0.05]",
      background: "bg-card/80",
    },
    animation: "",
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
  const [open, setOpen] = useState(false);
  const newTotalReserve = totalReserve || 0;
  const safeReserveUSD = totalReserveUSD || 0;
  const tier = getContributionTier(company.reserve);

  // Fireworks function
  const triggerFireworks = () => {
    const canvas = document.getElementById(
      "fireworks-canvas"
    ) as HTMLCanvasElement;
    if (!canvas) return;

    // Create a confetti instance bound to the canvas
    const myConfetti = confetti.create(canvas, {
      resize: true,
      useWorker: true,
    });

    const colors = [
      "#FFD700",
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
    ];

    // Fire confetti just a few times instead of continuously
    const fireTimes = [500]; // Fire at 0ms, 500ms, and 1000ms

    fireTimes.forEach((delay) => {
      setTimeout(() => {
        myConfetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: colors,
        });
      }, delay);
    });
  };

  // Trigger fireworks when modal opens for 5-digits and 6-digits tiers
  useEffect(() => {
    if (open && (tier.name === "5-digits" || tier.name === "6-digits")) {
      const timer = setTimeout(() => {
        triggerFireworks();
      }, 300); // Small delay to let modal fully open

      return () => clearTimeout(timer);
    }
  }, [open, tier.name]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <CustomDialogContent className="max-w-3xl p-0 overflow-hidden border-none">
        {/* Canvas for fireworks contained within modal */}
        <canvas
          id="fireworks-canvas"
          className="absolute inset-0 pointer-events-none z-10"
          width={800}
          height={600}
        />

        <div className="relative">
          {/* Dynamic Background with tier-specific gradient overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${tier.colors.gradient} transition-all duration-1000`}
          />
          <div
            className={`absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${tier.colors.radial} transition-all duration-1000`}
          />

          {/* Content */}
          <div className="relative p-8 animate-fade-in-up z-20">
            {/* Header Section */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4 animate-bounce-slow">
                <EthereumLogo
                  className={`w-20 h-20 ${tier.colors.text} ${tier.animation} transition-all duration-500`}
                />
                <div
                  className={`absolute inset-0 ${tier.colors.background} blur-2xl opacity-30`}
                />
                <div className="absolute -top-2 -right-2 text-2xl animate-bounce">
                  {tier.badge}
                </div>
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
                  <h2 className="text-3xl font-bold text-foreground tracking-tight truncate transition-all duration-500">
                    {company.name}
                  </h2>
                  <p className="text-xl font-medium text-muted-foreground animate-fade-in-delayed transition-all duration-500">
                    Contributing{" "}
                    <span
                      className={`${tier.colors.text} font-semibold transition-all duration-500`}
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
                  className={`inline-block p-6 rounded-2xl ${tier.colors.background} backdrop-blur-sm border ${tier.colors.border} transition-all duration-500 hover:scale-105`}
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
                <div className="flex justify-center">
                  <a
                    href="https://StrategicETHReserve.xyz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-all duration-300 hover:scale-105"
                  >
                    <Image
                      src="/images/strategicethreservexyz_dark.svg"
                      alt="Strategic ETH Reserve"
                      width={300}
                      height={50}
                      className="h-auto"
                    />
                  </a>
                </div>
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
