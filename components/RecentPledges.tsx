"use client";

import { Company } from "@/app/interfaces/interface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";

export default function RecentPledges({ pledges }: { pledges: Company[] }) {
  return (
    <section className="space-y-6">
      <div>
        <Image
          src="/images/recentpledges.svg"
          alt="Ethereum Champions"
          width={200}
          height={30}
          className="mb-2"
        />
        <p className="text-sm">Latest companies joining the SER movement</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-1">
        {pledges.map((pledge) => (
          <Card
            key={pledge.id}
            className="border-[hsl(var(--primary))] bg-card/80 backdrop-blur-sm neon-border"
          >
            <CardHeader>
              <CardTitle className="text-[hsl(var(--primary))]">
                {pledge.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  {pledge.category}
                </div>
                <div className="font-semibold text-[hsl(var(--primary))]">
                  {pledge.commitmentPercentage}% Commitment
                </div>
                <div className="text-sm text-muted-foreground">
                  Joined{" "}
                  {formatDistanceToNow(new Date(pledge.dateCommitment), {
                    addSuffix: true,
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
