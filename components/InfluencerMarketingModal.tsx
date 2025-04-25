"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Influencer } from "@/app/interfaces/interface";
import Image from "next/image";
import { EthereumLogo } from "@/components/icons/EthereumLogo";

interface InfluencerMarketingModalProps {
  influencer: Influencer;
  children: React.ReactNode;
}

export function InfluencerMarketingModal({
  influencer,
  children,
}: InfluencerMarketingModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <div className="relative">
          {/* Background with gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary),0.1)_0%,transparent_100%)]" />

          {/* Content */}
          <div className="relative p-8">
            {/* Header */}
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

            {/* Quote Section */}
            <div className="relative mb-8 mx-12">
              <div className="relative">
                <p className="text-2xl leading-relaxed text-center font-serif italic text-foreground/90">
                  &quot;{influencer.commitment}&quot;
                </p>
              </div>
            </div>

            {/* Influencer Info */}
            <div className="flex items-center justify-center gap-4">
              {influencer.avatar && (
                <div className="w-16 h-16 relative rounded-full overflow-hidden bg-background/50 border border-border/50">
                  <Image
                    src={influencer.avatar}
                    alt={influencer.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="text-center">
                <h3 className="text-xl font-semibold">{influencer.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {influencer.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
