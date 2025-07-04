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
    const fireTimes = [0, 500, 1000]; // Fire at 0ms, 500ms, and 1000ms

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
      <CustomDialogContent className="p-0 overflow-hidden bg-background/95 backdrop-blur-sm ">
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
          <div className="p-6 space-y-6 relative z-20">
            {/* Logo */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative flex items-center justify-center">
                <EthereumLogo className="w-14 h-14 text-[hsl(var(--primary))]" />
                <div className="absolute flex items-center justify-center w-6 h-6 rounded-full bg-[hsl(var(--primary))] -right-1 -bottom-1">
                  <span className="text-background text-lg font-bold">+</span>
                </div>
              </div>
              <div className="w-full max-w-[240px]">
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
            <div className="flex items-center justify-center gap-3 py-1">
              {company.logo && (
                <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-border/30">
                  <Image
                    src={company.logo}
                    alt={`${company.name} logo`}
                    fill
                    className="object-contain"
                    quality={100}
                  />
                </div>
              )}
              <h4 className="text-xl font-medium">{company.name}</h4>
            </div>

            {/* Reserve Data */}
            <div className="w-[350px] mx-auto bg-card/50 rounded-xl p-5 border border-border/30 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="text-sm text-muted-foreground">Previous</p>
                  <p className="text-2xl font-semibold flex items-center">
                    <EthereumLogo className="w-4 h-4 mr-1 text-[hsl(var(--primary))]" />
                    {previousReserve.toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
                <div className="text-xl font-semibold text-[hsl(var(--primary))]">
                  →
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current</p>
                  <p className="text-2xl font-semibold flex items-center">
                    <EthereumLogo className="w-4 h-4 mr-1 text-[hsl(var(--primary))]" />
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

            {/* Footer */}
            <p className="text-sm text-muted-foreground text-center">
              Join the movement at{" "}
              <a
                href="https://StrategicETHReserve.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[hsl(var(--primary))] hover:underline"
              >
                StrategicETHReserve.xyz
              </a>
            </p>
          </div>
        )}
      </CustomDialogContent>
    </Dialog>
  );
}
