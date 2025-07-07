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
  showUSD: boolean;
  ethPrice: number;
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
  showUSD,
  ethPrice,
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
      const dataPoint = payload[0].payload;
      const increase = dataPoint.dayOverDayIncrease || 0;
      const isSignificantIncrease = increase >= 100000;
      const ethValue = payload[0].value;
      const usdValue = dataPoint.usd || payload[0].value * ethPrice;

      return (
        <div className="bg-card/95 backdrop-blur-sm border border-[hsl(var(--primary))] rounded-lg p-3 shadow-lg">
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          {/* Always show ETH value first */}
          <div className="flex items-center gap-0 mb-1">
            <EthereumLogo className="w-4 h-4 text-[hsl(var(--primary))]" />
            <p className="text-[hsl(var(--primary))] font-semibold">
              {`${ethValue.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })} ETH`}
            </p>
          </div>
          {/* Always show USD value below */}
          <div className="items-center gap-2 mb-1">
            <p className="text-[hsl(var(--primary))] font-medium text-sm">
              {`$${usdValue.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}`}
            </p>
          </div>

          {isSignificantIncrease && (
            <div className="mt-0 pt-0 border-t border-yellow-500/20">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <p className="text-xs text-yellow-500 font-medium">
                  new 6-digit member!
                </p>
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom dot component for significant increases
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const increase = payload.dayOverDayIncrease || 0;
    const isSignificantIncrease = increase >= 100000;

    if (!isSignificantIncrease) return null;

    return (
      <g>
        {/* Outer glow ring */}
        <circle
          cx={cx}
          cy={cy}
          r="8"
          fill="none"
          stroke="rgb(234 179 8)"
          strokeWidth="1"
          opacity="0.3"
        />
        {/* Inner gold dot */}
        <circle
          cx={cx}
          cy={cy}
          r="4"
          fill="rgb(234 179 8)"
          stroke="hsl(var(--background))"
          strokeWidth="1"
        />
      </g>
    );
  };

  // Process chart data to calculate day-over-day increases and prepare display values
  const processedChartData = chartData.map((point, index) => {
    const dayOverDayIncrease =
      index === 0 ? 0 : point.reserve - chartData[index - 1].reserve;
    const displayValue = point.reserve; // Always use ETH values

    return {
      ...point,
      dayOverDayIncrease,
      displayValue,
    };
  });

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="bg-card/80 backdrop-blur-sm border border-[hsl(var(--primary))] neon-border rounded-2xl p-6 h-full institutional-shadow-lg">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-[hsl(var(--primary))] mb-1 flex items-center gap-2">
              <EthereumLogo className="w-4 h-4" />
              Strategic ETH Reserve
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
      <div className="bg-card/80 backdrop-blur-sm border border-[hsl(var(--primary))] neon-border rounded-2xl p-6 h-full institutional-shadow-lg">
        <div className="h-[200px] w-full">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              No historical data available
            </div>
          ) : (
            <div className="relative w-full h-full">
              {/* Subtle watermark text in center */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="text-[hsl(var(--primary))] opacity-20 text-sm sm:text-md font-bold tracking-wider select-none">
                  STRATEGICETHRESERVE.XYZ
                </div>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={processedChartData}
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
                    tickFormatter={(value) => {
                      const thousands = value / 1000;
                      if (thousands >= 1000) {
                        const millions = thousands / 1000;
                        return `${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(2)}M`;
                      } else if (thousands >= 1) {
                        return `${thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1)}k`;
                      } else {
                        return value.toString();
                      }
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="displayValue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={<CustomDot />}
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
