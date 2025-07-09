#!/usr/bin/env tsx

import { getValidatorBalance } from "../lib/web3";
import { formatEther } from "viem";

async function testValidatorBalance(walletAddress: string) {
  try {
    console.log(`🔍 Testing validator balance for wallet: ${walletAddress}`);
    console.log("=".repeat(80));

    console.log("🔄 Fetching validator balance...");
    const startTime = Date.now();

    const validatorBalance = await getValidatorBalance(walletAddress);

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log("\n📊 RESULTS:");
    console.log(`💎 Validator Balance: ${formatEther(validatorBalance)} ETH`);
    console.log(`🔢 Raw Balance (wei): ${validatorBalance.toString()}`);
    console.log(`⏱️  Execution Time: ${duration}ms`);

    if (validatorBalance === BigInt(0)) {
      console.log("⚠️  No validator balance found for this wallet");
    } else {
      console.log("✅ Successfully retrieved validator balance");
    }
  } catch (error) {
    console.error("❌ Error fetching validator balance:", error);
    process.exit(1);
  }
}

// Get wallet address from command line arguments
const walletAddress = process.argv[2];

if (!walletAddress) {
  console.error(
    "❌ Usage: tsx scripts/test-validator-balance.ts <wallet-address>"
  );
  console.error(
    "📝 Example: tsx scripts/test-validator-balance.ts 0x1234567890123456789012345678901234567890"
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

console.log("🚀 Starting validator balance test...\n");

// Run the script
testValidatorBalance(walletAddress).catch((error) => {
  console.error("❌ Unhandled error:", error);
  process.exit(1);
});
