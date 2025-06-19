import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get all snapshots ordered by date
    const snapshots = await prisma.snapshot.findMany({
      orderBy: {
        snapshotDate: "asc",
      },
      select: {
        totalReserve: true,
        totalReserveUSD: true,
        snapshotDate: true,
      },
    });

    if (snapshots.length === 0) {
      return NextResponse.json({ chartData: [] });
    }

    // Convert totalReserve from string to number
    const processedSnapshots = snapshots.map((snapshot) => ({
      ...snapshot,
      totalReserve: parseFloat(snapshot.totalReserve),
    }));

    // Determine if we should use monthly or weekly aggregation
    const firstDate = new Date(processedSnapshots[0].snapshotDate);
    const lastDate = new Date(
      processedSnapshots[processedSnapshots.length - 1].snapshotDate
    );
    const daysDiff = Math.ceil(
      (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // If we have less than 84 days (12 weeks), use weekly aggregation
    // Otherwise, use monthly aggregation
    const useWeekly = daysDiff < 84;

    let chartData;

    if (useWeekly) {
      // Weekly aggregation - group by week and take the latest snapshot from each week
      const weeklyData = new Map();

      processedSnapshots.forEach((snapshot) => {
        const date = new Date(snapshot.snapshotDate);
        // Get the Monday of the week
        const monday = new Date(date);
        monday.setDate(date.getDate() - (date.getDay() || 7) + 1);
        const weekKey = monday.toISOString().split("T")[0];

        // Keep the latest snapshot from each week
        if (
          !weeklyData.has(weekKey) ||
          new Date(snapshot.snapshotDate) >
            new Date(weeklyData.get(weekKey).snapshotDate)
        ) {
          weeklyData.set(weekKey, snapshot);
        }
      });

      chartData = Array.from(weeklyData.values())
        .sort(
          (a, b) =>
            new Date(a.snapshotDate).getTime() -
            new Date(b.snapshotDate).getTime()
        )
        .slice(-12) // Take last 12 weeks
        .map((snapshot) => ({
          period: new Date(snapshot.snapshotDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          reserve: snapshot.totalReserve,
          usd: snapshot.totalReserveUSD,
          date: snapshot.snapshotDate,
        }));
    } else {
      // Monthly aggregation - group by month and take the latest snapshot from each month
      const monthlyData = new Map();

      processedSnapshots.forEach((snapshot) => {
        const date = new Date(snapshot.snapshotDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

        // Keep the latest snapshot from each month
        if (
          !monthlyData.has(monthKey) ||
          new Date(snapshot.snapshotDate) >
            new Date(monthlyData.get(monthKey).snapshotDate)
        ) {
          monthlyData.set(monthKey, snapshot);
        }
      });

      chartData = Array.from(monthlyData.values())
        .sort(
          (a, b) =>
            new Date(a.snapshotDate).getTime() -
            new Date(b.snapshotDate).getTime()
        )
        .slice(-12) // Take last 12 months
        .map((snapshot) => ({
          period: new Date(snapshot.snapshotDate).toLocaleDateString("en-US", {
            month: "short",
            year:
              new Date(snapshot.snapshotDate).getFullYear() !==
              new Date().getFullYear()
                ? "numeric"
                : undefined,
          }),
          reserve: snapshot.totalReserve,
          usd: snapshot.totalReserveUSD,
          date: snapshot.snapshotDate,
        }));
    }

    return NextResponse.json({
      chartData,
      periodType: useWeekly ? "weekly" : "monthly",
    });
  } catch (error) {
    console.error("Error fetching chart data:", error);
    return NextResponse.json(
      { error: "Failed to fetch chart data" },
      { status: 500 }
    );
  }
}
