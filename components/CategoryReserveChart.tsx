import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { EthereumLogo } from "@/components/icons/EthereumLogo";
import { Company } from "@/app/interfaces/interface";
import { useMemo } from "react";

interface CategoryReserveChartProps {
  companies: Company[];
}

interface CategoryData {
  category: string;
  reserve: number;
  percentage: number;
  count: number;
}

// Define colors for different categories
const CATEGORY_COLORS = [
  "#00FFAA", // Primary green
  "#60A5FA", // Blue
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#10B981", // Emerald
  "#F97316", // Orange
  "#EC4899", // Pink
  "#6B7280", // Gray
  "#84CC16", // Lime
];

export default function CategoryReserveChart({
  companies,
}: CategoryReserveChartProps) {
  const categoryData = useMemo(() => {
    const activeCompanies = companies.filter(
      (company) => company.status === "ACTIVE" && company.reserve > 0
    );

    if (activeCompanies.length === 0) {
      return [];
    }

    const totalReserve = activeCompanies.reduce(
      (sum, company) => sum + company.reserve,
      0
    );

    // Group by category
    const categoryMap = new Map<string, { reserve: number; count: number }>();

    activeCompanies.forEach((company) => {
      const existing = categoryMap.get(company.category) || {
        reserve: 0,
        count: 0,
      };
      categoryMap.set(company.category, {
        reserve: existing.reserve + company.reserve,
        count: existing.count + 1,
      });
    });

    // Convert to array and calculate percentages
    const data: CategoryData[] = Array.from(categoryMap.entries())
      .map(([category, { reserve, count }]) => ({
        category,
        reserve,
        count,
        percentage: (reserve / totalReserve) * 100,
      }))
      .sort((a, b) => b.reserve - a.reserve); // Sort by reserve amount

    return data;
  }, [companies]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card/95 backdrop-blur-sm border border-[hsl(var(--primary))] rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold text-[hsl(var(--primary))] mb-2">
            {data.category}
          </p>
          <div className="flex items-center gap-2 mb-1">
            <EthereumLogo className="w-4 h-4 text-[hsl(var(--primary))]" />
            <p className="text-[hsl(var(--primary))] font-semibold">
              {data.reserve.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}{" "}
              ETH
            </p>
          </div>
          <p className="text-xs text-muted-foreground mb-1">
            {data.percentage.toFixed(1)}% of total reserve
          </p>
          <p className="text-xs text-muted-foreground">
            {data.count} {data.count === 1 ? "entity" : "entities"}
          </p>
        </div>
      );
    }
    return null;
  };

  if (categoryData.length === 0) {
    return (
      <div className="w-full">
        <div className="bg-card/80 backdrop-blur-sm border border-[hsl(var(--primary))] neon-border rounded-2xl p-6 h-full">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-[hsl(var(--primary))] mb-1 flex items-center gap-2">
              <EthereumLogo className="w-4 h-4" />
              Reserve by Category
            </h2>
          </div>
          <div className="h-[200px] w-full flex items-center justify-center text-muted-foreground text-sm">
            No data available
          </div>
        </div>
      </div>
    );
  }

  //   const renderCustomizedLabel = ({ category, reserve, percentage }: any) => {

  return (
    <div className="w-full">
      <div className="bg-card/80 backdrop-blur-sm border border-[hsl(var(--primary))] neon-border rounded-2xl p-3 h-full">
        <div className="h-[225px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                label={({
                  category,
                  cx,
                  cy,
                  midAngle,
                  innerRadius,
                  outerRadius,
                }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = outerRadius + 30; // Position beyond the outer radius
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);

                  const words = category.split(" ");
                  const lineHeight = 14; // Adjust line spacing
                  const startY = y - ((words.length - 1) * lineHeight) / 2; // Center the text block

                  return (
                    <text
                      x={x}
                      y={startY}
                      fill="hsl(var(--foreground))"
                      textAnchor={x > cx ? "start" : "end"}
                      dominantBaseline="central"
                      fontSize="10"
                      fontWeight="500"
                    >
                      {words.map((word: string, index: number) => (
                        <tspan
                          key={index}
                          x={x}
                          dy={index === 0 ? 0 : lineHeight}
                        >
                          {word}
                        </tspan>
                      ))}
                    </text>
                  );
                }}
                legendType="circle"
                labelLine={true}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={80}
                paddingAngle={2}
                dataKey="reserve"
                stroke="hsl(var(--background))"
                strokeWidth={2}
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
