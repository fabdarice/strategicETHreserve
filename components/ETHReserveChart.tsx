import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { EthereumLogo } from "@/components/icons/EthereumLogo";
import { useEffect, useState } from "react";
import CircleLoader from "react-spinners/ClipLoader";

interface ETHReserveChartProps {
  totalReserve: number;
  totalReserveUSD: number;
}

interface ChartDataPoint {
  period: string;
  reserve: number;
  usd: number;
  date: string;
}

export default function ETHReserveChart({
  totalReserve,
  totalReserveUSD,
}: ETHReserveChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [periodType, setPeriodType] = useState<"weekly" | "monthly">("monthly");

  useEffect(() => {
    async function fetchChartData() {
      try {
        const response = await fetch("/api/snapshots/chart");
        if (!response.ok) {
          throw new Error("Failed to fetch chart data");
        }
        const data = await response.json();
        setChartData(data.chartData || []);
        setPeriodType(data.periodType || "monthly");
      } catch (error) {
        console.error("Error fetching chart data:", error);
        // Fallback to current data point if API fails
        setChartData([
          {
            period: new Date().toLocaleDateString("en-US", { month: "short" }),
            reserve: totalReserve,
            usd: totalReserveUSD,
            date: new Date().toISOString(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchChartData();
  }, [totalReserve, totalReserveUSD]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/95 backdrop-blur-sm border border-[hsl(var(--primary))] rounded-lg p-3 shadow-lg">
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <div className="flex items-center gap-2 mb-1">
            <EthereumLogo className="w-4 h-4 text-[hsl(var(--primary))]" />
            <p className="text-[hsl(var(--primary))] font-semibold">
              {`${payload[0].value.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })} ETH`}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            {`~$${(payload[0].payload.usd || 0).toLocaleString()}`}
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="bg-card/80 backdrop-blur-sm border border-[hsl(var(--primary))] neon-border rounded-2xl p-6 h-full">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-[hsl(var(--primary))] mb-1 flex items-center gap-2">
              <EthereumLogo className="w-4 h-4" />
              Strategic ETH Reserve Growth
            </h2>
            <p className="text-xs text-muted-foreground">
              Loading historical data...
            </p>
          </div>
          <div className="h-[200px] w-full flex items-center justify-center">
            <CircleLoader color="hsl(var(--primary))" size={40} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-card/80 backdrop-blur-sm border border-[hsl(var(--primary))] neon-border rounded-2xl p-6 h-full">
        <div className="h-[200px] w-full">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              No historical data available
            </div>
          ) : (
            <div className="relative w-full h-full">
              {/* Subtle watermark text in center */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="text-[hsl(var(--primary))] opacity-10 text-sm sm:text-lg lg:text-2xl font-bold tracking-wider select-none">
                  Strategic ETH Reserve
                </div>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 20, left: -15, bottom: -10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--primary))"
                    opacity={0.1}
                  />
                  <XAxis
                    dataKey="period"
                    stroke="hsl(var(--primary))"
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--primary))"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="reserve"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{
                      fill: "hsl(var(--primary))",
                      strokeWidth: 1,
                      r: 3,
                      stroke: "hsl(var(--background))",
                    }}
                    activeDot={{
                      r: 5,
                      fill: "hsl(var(--primary))",
                      stroke: "hsl(var(--background))",
                      strokeWidth: 2,
                      filter: "drop-shadow(0 0 6px hsl(var(--primary)))",
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
