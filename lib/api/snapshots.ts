import { prisma } from "@/lib/prisma";

export interface ChartDataPoint {
  period: string;
  reserve: number;
  usd: number;
  date: Date;
  totalCompanies: number;
}

export interface ChartResponse {
  chartData: ChartDataPoint[];
  periodType: "weekly" | "monthly";
}

export async function getChartData(): Promise<ChartResponse> {
  const snapshots = await prisma.snapshot.findMany({
    orderBy: {
      snapshotDate: "asc",
    },
    select: {
      totalReserve: true,
      totalReserveUSD: true,
      totalCompanies: true,
      snapshotDate: true,
    },
  });

  if (snapshots.length === 0) {
    return { chartData: [], periodType: "weekly" };
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
  const useWeekly = daysDiff < 190;

  let chartData: ChartDataPoint[];

  if (useWeekly) {
    chartData = aggregateWeeklyData(processedSnapshots);
  } else {
    chartData = aggregateMonthlyData(processedSnapshots);
  }

  return {
    chartData,
    periodType: useWeekly ? "weekly" : "monthly",
  };
}

function aggregateWeeklyData(snapshots: any[]): ChartDataPoint[] {
  const weeklyData = new Map();

  snapshots.forEach((snapshot) => {
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

  return Array.from(weeklyData.values())
    .sort(
      (a, b) =>
        new Date(a.snapshotDate).getTime() - new Date(b.snapshotDate).getTime()
    )
    .slice(-25) // Take last 12 weeks
    .map((snapshot) => ({
      period: new Date(snapshot.snapshotDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      reserve: snapshot.totalReserve,
      usd: snapshot.totalReserveUSD,
      totalCompanies: snapshot.totalCompanies,
      date: snapshot.snapshotDate,
    }));
}

function aggregateMonthlyData(snapshots: any[]): ChartDataPoint[] {
  const monthlyData = new Map();

  snapshots.forEach((snapshot) => {
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

  return Array.from(monthlyData.values())
    .sort(
      (a, b) =>
        new Date(a.snapshotDate).getTime() - new Date(b.snapshotDate).getTime()
    )
    .slice(-24) // Take last 12 months
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
      totalCompanies: snapshot.totalCompanies,
      date: snapshot.snapshotDate,
    }));
}

export async function getCompanyReserveData(companyId: string) {
  const companySnapshots = await prisma.snapshotCompany.findMany({
    where: {
      companyId: companyId,
    },
    orderBy: {
      snapshotDate: "desc",
    },
    select: {
      reserve: true,
      snapshotDate: true,
    },
    take: 2,
  });

  if (companySnapshots.length === 0) {
    return {
      totalReserve: 0,
      previousReserve: 0,
    };
  }

  // Current (latest) snapshot
  const totalReserve = companySnapshots[0]?.reserve || 0;

  // Previous snapshot if available
  const previousReserve =
    companySnapshots.length > 1 ? companySnapshots[1]?.reserve || 0 : 0;

  return {
    totalReserve,
    previousReserve,
  };
}

export function createSnapshotDate(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0)
  );
}
