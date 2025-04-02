"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function TotalReserve() {
  const [totalReserve, setTotalReserve] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTotalReserve = async () => {
      try {
        const response = await fetch("/api/total-reserve");
        const data = await response.json();
        setTotalReserve(data.totalReserve);
      } catch (error) {
        console.error("Error fetching total reserve:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTotalReserve();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Total ETH Reserve</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Total ETH Reserve</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          {totalReserve?.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          ETH
        </div>
      </CardContent>
    </Card>
  );
}
