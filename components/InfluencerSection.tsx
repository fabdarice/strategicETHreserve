"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { Influencer } from "@/app/interfaces/interface";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";

export default function InfluencerSection({
  influencers,
}: {
  influencers: Influencer[];
}) {
  const [api, setApi] = useState<any>(null);

  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 5000); // Change quote every 5 seconds

    return () => clearInterval(interval);
  }, [api]);

  return (
    <section className="space-y-6">
      <div>
        <Image
          src="/images/ethchampions.svg"
          alt="Ethereum Champions"
          width={250}
          height={50}
          className="mb-2"
        />
        <p className="text-sm">
          Notable figures supporting SER-aligned protocols
        </p>
      </div>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        setApi={setApi}
        className="w-full"
      >
        <CarouselContent>
          {influencers.map((influencer) => (
            <CarouselItem
              key={influencer.id}
              className="md:basis-1/2 lg:basis-1/3"
            >
              <Card className="border-[hsl(var(--primary))] bg-card/80 backdrop-blur-sm neon-border overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-4 p-6">
                  <Avatar className="h-12 w-12 ring-2 ring-[hsl(var(--primary))] ring-offset-2 ring-offset-background">
                    <AvatarImage
                      src={influencer.avatar || ""}
                      alt={influencer.name}
                    />
                    <AvatarFallback className="bg-[hsl(var(--primary))]">
                      {influencer.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[hsl(var(--primary))]">
                      {influencer.name}
                    </h3>
                    {influencer.twitter && (
                      <a
                        href={`https://twitter.com/${influencer.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-muted-foreground hover:text-[hsl(var(--primary))] transition-colors"
                      >
                        @{influencer.twitter}
                      </a>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <p className="text-sm text-muted-foreground mb-4">
                    {influencer.description}
                  </p>
                  <p className="text-sm font-medium text-[hsl(var(--primary))]">
                    &quot;{influencer.commitment}&quot;
                  </p>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
