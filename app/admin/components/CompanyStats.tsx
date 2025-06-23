"use client";

interface CompanyStatsProps {
  totalReserve: number;
  totalReserveUSD: number;
}

export function CompanyStats({
  totalReserve,
  totalReserveUSD,
}: CompanyStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-700">
          Total Reserve (ETH)
        </h3>
        <p className="text-2xl font-bold text-blue-600">
          {totalReserve.toFixed(2)}
        </p>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-700">
          Total Reserve (USD)
        </h3>
        <p className="text-2xl font-bold text-green-600">
          ${totalReserveUSD.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
