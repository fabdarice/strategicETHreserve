#!/usr/bin/env tsx

import { getETHBalanceAllNetworks } from "../lib/web3";
import { formatEther } from "viem";

async function testETHBalanceAllNetworks(walletAddress: string) {
  try {
    console.log(
      `🔍 Testing ETH balance across all networks for wallet: ${walletAddress}`
    );
    console.log("=".repeat(80));

    console.log("🔄 Fetching ETH balance from all networks...");
    const startTime = Date.now();

    const ethBalance = await getETHBalanceAllNetworks(walletAddress);

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log("\n📊 RESULTS:");
    console.log(`💎 Total ETH Balance: ${formatEther(ethBalance)} ETH`);
    console.log(`🔢 Raw Balance (wei): ${ethBalance.toString()}`);
    console.log(`⏱️  Execution Time: ${duration}ms`);

    if (ethBalance === BigInt(0)) {
      console.log(
        "⚠️  No ETH balance found for this wallet across all networks"
      );
    } else {
      console.log("✅ Successfully retrieved ETH balance from all networks");
    }
  } catch (error) {
    console.error("❌ Error fetching ETH balance:", error);
    process.exit(1);
  }
}

// Get wallet address from command line arguments
const walletAddress = process.argv[2];

if (!walletAddress) {
  console.error(
    "❌ Usage: tsx scripts/test-eth-balance-all-networks.ts <wallet-address>"
  );
  console.error(
    "📝 Example: tsx scripts/test-eth-balance-all-networks.ts 0x1234567890123456789012345678901234567890"
  );
  process.exit(1);
}

// Basic validation of wallet address format
if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
  console.error(
    "❌ Invalid wallet address format. Must be a 40-character hex string starting with 0x"
  );
  process.exit(1);
}

console.log("🚀 Starting ETH balance all networks test...\n");

// Run the script
testETHBalanceAllNetworks(walletAddress).catch((error) => {
  console.error("❌ Unhandled error:", error);
  process.exit(1);
});
