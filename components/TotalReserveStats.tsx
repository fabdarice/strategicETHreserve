import { EthereumLogo } from "@/components/icons/EthereumLogo";

interface TotalReserveStatsProps {
  totalReserve: number;
  totalReserveUSD: number;
  activeCompanyCount: number;
  percentageOfCirculatingSupply: number;
  showUSD: boolean;
}

export default function TotalReserveStats({
  totalReserve,
  totalReserveUSD,
  activeCompanyCount,
  percentageOfCirculatingSupply,
  showUSD,
}: TotalReserveStatsProps) {
  return (
    <div className="w-full lg:w-auto lg:flex-1">
      <div className="inline-block w-full p-6 rounded-2xl bg-card/80 backdrop-blur-sm border border-[hsl(var(--primary))] neon-border h-full institutional-shadow-xl">
        <div className="flex flex-col items-center gap-3 h-[200px] justify-center">
          <p className="text-sm uppercase tracking-wider">
            Total Strategic ETH Reserve
          </p>
          {/* Always show ETH as primary value */}
          <div className="flex items-center gap-2">
            <EthereumLogo className="w-6 h-6 text-[hsl(var(--primary))]" />
            <p className="text-3xl font-bold text-[hsl(var(--primary))] leading-none">
              {totalReserve.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
              {" ETH"}
            </p>
          </div>

          {/* Always show USD as secondary value */}
          <div className="mt-0 flex items-center gap-2 bg-[hsl(var(--primary))/0.05] p-2 rounded-xl backdrop-blur-sm">
            <p className="text-lg font-medium text-[hsl(var(--primary-foreground))] secondary-value-text leading-none">
              $
              {totalReserveUSD.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </p>
          </div>

          {/* Combined Participants and Percentage of Circulating Supply */}
          <div className="mt-3 text-xs flex items-center justify-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Participants:</span>
              <span className="font-medium text-[hsl(var(--primary))]">
                {activeCompanyCount}
              </span>
            </div>
            <span className="text-muted-foreground">|</span>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">% of Supply:</span>
              <span className="font-medium text-[hsl(var(--primary))]">
                {percentageOfCirculatingSupply.toLocaleString(undefined, {
                  minimumFractionDigits: 4,
                  maximumFractionDigits: 4,
                })}
                %
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
