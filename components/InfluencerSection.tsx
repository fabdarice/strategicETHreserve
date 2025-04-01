"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { Influencer } from "@/app/interfaces/interface";

export default function InfluencerSection({
  influencers,
}: {
  influencers: Influencer[];
}) {
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
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {influencers.map((influencer) => (
          <Card
            key={influencer.id}
            className="border-[hsl(var(--primary))] bg-card/80 backdrop-blur-sm neon-border overflow-hidden"
          >
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
        ))}
      </div>
    </section>
  );
}
