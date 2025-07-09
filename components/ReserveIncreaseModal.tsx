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
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-xl translate-x-[-50%] translate-y-[-50%] gap-4 border-2 border-[hsl(var(--primary))] bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));
CustomDialogContent.displayName = DialogPrimitive.Content.displayName;

interface ReserveData {
  totalReserve: number;
  previousReserve: number;
}

interface ReserveIncreaseModalProps {
  company: Company;
  children: React.ReactNode;
}

export function ReserveIncreaseModal({
  company,
  children,
}: ReserveIncreaseModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reserveData, setReserveData] = useState<ReserveData>({
    totalReserve: 0,
    previousReserve: 0,
  });

  const { totalReserve, previousReserve } = reserveData;

  useEffect(() => {
    if (open && company.id) {
      fetchReserveData();
    }
  }, [open, company.id]);

  const fetchReserveData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/snapshots/reserve?companyId=${company.id}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch reserve data");
      }

      const data = await response.json();
      setReserveData(data);
    } catch (error) {
      console.error("Error fetching reserve data:", error);
    } finally {
      setLoading(false);
    }
  };

  const increase = totalReserve - previousReserve;
  const increasePercentage =
    previousReserve > 0
      ? ((totalReserve - previousReserve) / previousReserve) * 100
      : 100;

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

  // Trigger fireworks when modal opens and data is loaded
  useEffect(() => {
    if (open && !loading && totalReserve > 0) {
      const timer = setTimeout(() => {
        triggerFireworks();
      }, 300); // Small delay to let modal fully open

      return () => clearTimeout(timer);
    }
  }, [open, loading, totalReserve]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <CustomDialogContent className="max-w-3xl p-0 overflow-hidden bg-background/95 backdrop-blur-sm">
        {/* Canvas for fireworks contained within modal */}
        <canvas
          id="fireworks-canvas"
          className="absolute inset-0 pointer-events-none z-10"
          width={600}
          height={600}
        />

        {loading ? (
          <div className="p-6 flex justify-center items-center relative z-20">
            <p className="text-lg">Loading reserve data...</p>
          </div>
        ) : (
          <div className="p-8 space-y-6 relative z-20">
            {/* Logo */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4 animate-bounce-slow">
                <EthereumLogo className="w-20 h-20 text-[hsl(var(--primary))] transition-all duration-500" />
                <div className="absolute flex items-center justify-center w-8 h-8 rounded-full bg-[hsl(var(--primary))] -right-2 -bottom-2">
                  <span className="text-background text-xl font-bold">+</span>
                </div>
              </div>
              <div className="w-full max-w-md animate-slide-in">
                <Image
                  src="/images/strategicethreserve.svg"
                  alt="Strategic Ethereum Reserve"
                  width={507}
                  height={400}
                  className="w-full h-auto"
                  quality={100}
                />
              </div>
            </div>

            {/* Company Info */}
            <div className="flex items-center justify-center gap-6 py-1 animate-slide-in-delayed">
              {company.logo && (
                <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 border-2 border-[hsl(var(--primary))] bg-card/80 backdrop-blur-sm shadow-lg transition-all duration-500 hover:scale-105">
                  <Image
                    src={company.logo}
                    alt={`${company.name} logo`}
                    fill
                    className="object-contain p-2"
                    quality={100}
                  />
                </div>
              )}
              <h4 className="text-3xl font-bold text-foreground tracking-tight">
                {company.name}
              </h4>
            </div>

            {/* Reserve Data */}
            <div className="w-full max-w-xl mx-auto mt-8 animate-slide-up">
              <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-[hsl(var(--primary))]/20 shadow-lg transition-all duration-500 hover:scale-105">
                <div className="flex justify-center items-center gap-8 mb-3">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Previous</p>
                    <p className="text-3xl font-bold flex items-center text-gray-500">
                      <EthereumLogo className="w-6 h-6 mr-2 text-gray-500" />
                      {previousReserve.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </p>
                  </div>
                  <div className="text-3xl font-bold text-[hsl(var(--primary))]">
                    →
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Current</p>
                    <p className="text-3xl font-bold flex items-center">
                      <EthereumLogo className="w-6 h-6 mr-2 text-[hsl(var(--primary))]" />
                      {totalReserve.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </p>
                  </div>
                </div>

                <div className="bg-[hsl(var(--primary))/0.1] rounded-lg py-3 flex items-center justify-center shadow-inner">
                  <p className="text-[hsl(var(--primary))] text-lg font-bold">
                    +
                    {increase.toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}{" "}
                    ETH (+{increasePercentage.toFixed(1)}%)
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
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
        )}

        {/* Custom CSS for animations */}
        <style jsx>{`
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

          .animate-bounce-slow {
            animation: bounce-slow 3s infinite;
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
        `}</style>
      </CustomDialogContent>
    </Dialog>
  );
}
