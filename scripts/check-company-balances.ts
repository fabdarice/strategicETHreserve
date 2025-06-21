#!/usr/bin/env tsx

import { PrismaClient } from "@prisma/client";
import { getCompleteETHBalance } from "../lib/web3";
import { formatEther } from "viem";

const prisma = new PrismaClient();

async function checkCompanyBalances(companyName: string) {
  try {
    console.log(`🔍 Looking up company: ${companyName}`);

    // Find the company by name (case-insensitive)
    const company = await prisma.company.findFirst({
      where: {
        name: {
          contains: companyName,
          mode: "insensitive",
        },
      },
      include: {
        wallets: true,
      },
    });

    if (!company) {
      console.error(`❌ Company "${companyName}" not found`);
      process.exit(1);
    }

    console.log(`\n📊 Company: ${company.name}`);
    console.log(`📝 Category: ${company.category}`);
    console.log(`💰 Current Reserve: ${company.currentReserve} ETH`);
    console.log(`🔗 Wallets: ${company.wallets.length}`);
    console.log("\n" + "=".repeat(80));

    if (company.wallets.length === 0) {
      console.log("⚠️  No wallets found for this company");
      return;
    }

    let totalBalance = BigInt(0);
    let totalPoolBalance = BigInt(0);
    let totalDirectBalance = BigInt(0);

    // Process each wallet address
    for (let i = 0; i < company.wallets.length; i++) {
      const wallet = company.wallets[i];
      console.log(
        `\n📍 Wallet ${i + 1}/${company.wallets.length}: ${wallet.address}`
      );
      console.log(`   Auto Scan: ${wallet.autoScan ? "✅" : "❌"}`);
      console.log(`   DB Balance: ${wallet.balance} ETH`);

      try {
        console.log("   🔄 Fetching live balance...");

        const balance = await getCompleteETHBalance(wallet.address);

        // Convert from wei to ETH for display
        const totalEth = formatEther(balance.totalBalance);
        const directEth = formatEther(balance.directBalance);
        const poolEth = formatEther(balance.poolBalance);

        console.log(`   💎 Total Balance: ${totalEth} ETH`);
        console.log(`   💰 Direct Holdings: ${directEth} ETH`);
        console.log(`   🏊 Pool Positions: ${poolEth} ETH`);

        // Show pool details if any
        if (balance.poolDetails.length > 0) {
          console.log(`   📋 Pool Details:`);
          balance.poolDetails.forEach((pool, idx) => {
            const poolEthAmount = formatEther(pool.ethAmount);
            console.log(`      ${idx + 1}. ${pool.network} - ${pool.poolType}`);
            console.log(`         Pool: ${pool.poolAddress}`);
            console.log(`         ETH Amount: ${poolEthAmount} ETH`);
            if (pool.token0 && pool.token1) {
              console.log(`         Tokens: ${pool.token0} / ${pool.token1}`);
            }
          });
        }

        // Add to totals
        totalBalance += balance.totalBalance;
        totalPoolBalance += balance.poolBalance;
        totalDirectBalance += balance.directBalance;
      } catch (error) {
        console.error(`   ❌ Error fetching balance: ${error}`);
      }

      // Add separator between wallets
      if (i < company.wallets.length - 1) {
        console.log("\n" + "-".repeat(40));
      }
    }

    // Display totals
    console.log("\n" + "=".repeat(80));
    console.log("📈 COMPANY TOTALS:");
    console.log(`💎 Total Balance: ${formatEther(totalBalance)} ETH`);
    console.log(`💰 Total Direct: ${formatEther(totalDirectBalance)} ETH`);
    console.log(`🏊 Total Pools: ${formatEther(totalPoolBalance)} ETH`);
    console.log(
      `📊 DB vs Live: ${company.currentReserve} ETH vs ${formatEther(totalBalance)} ETH`
    );

    const difference =
      parseFloat(formatEther(totalBalance)) - company.currentReserve;
    const diffSymbol = difference >= 0 ? "+" : "";
    console.log(`📊 Difference: ${diffSymbol}${difference.toFixed(6)} ETH`);
  } catch (error) {
    console.error("❌ Script error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get company name from command line arguments
const companyName = process.argv[2];

if (!companyName) {
  console.error(
    '❌ Usage: tsx scripts/check-company-balances.ts "Company Name"'
  );
  console.error(
    '📝 Example: tsx scripts/check-company-balances.ts "MicroStrategy"'
  );
  process.exit(1);
}

// Run the script
checkCompanyBalances(companyName).catch((error) => {
  console.error("❌ Unhandled error:", error);
  process.exit(1);
});
