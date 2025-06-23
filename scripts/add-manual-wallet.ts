#!/usr/bin/env tsx

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function addManualWallet(companyName: string, balance: number) {
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

    console.log(`✅ Found company: ${company.name}`);
    console.log(`📊 Current wallets: ${company.wallets.length}`);

    // Find the next manual wallet number
    const existingManualWallets = company.wallets.filter((wallet) =>
      wallet.address.startsWith("0xmanual")
    );

    const nextNumber = existingManualWallets.length + 1;
    const manualAddress = `0xmanual${nextNumber}`;

    console.log(`🔧 Creating manual wallet: ${manualAddress}`);
    console.log(`💰 Balance: ${balance} ETH`);
    console.log(`🔄 Auto Scan: false`);

    // Create the manual wallet
    const newWallet = await prisma.companyWallet.create({
      data: {
        companyId: company.id,
        address: manualAddress,
        balance: balance,
        autoScan: false,
      },
    });

    console.log("\n✅ Manual wallet created successfully!");
    console.log(`📋 Wallet ID: ${newWallet.id}`);
    console.log(`🏢 Company: ${company.name}`);
    console.log(`📍 Address: ${newWallet.address}`);
    console.log(`💰 Balance: ${newWallet.balance} ETH`);
    console.log(`🔄 Auto Scan: ${newWallet.autoScan}`);
    console.log(`📅 Created: ${newWallet.createdAt}`);

    // Update company's total reserve
    const totalBalance =
      company.wallets.reduce((sum, wallet) => sum + wallet.balance, 0) +
      balance;

    await prisma.company.update({
      where: { id: company.id },
      data: { currentReserve: totalBalance },
    });

    console.log(`\n📊 Updated company total reserve: ${totalBalance} ETH`);
    console.log(`📈 Previous total: ${company.currentReserve} ETH`);
    console.log(`➕ Added: ${balance} ETH`);
  } catch (error) {
    console.error("❌ Script error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get arguments from command line
const companyName = process.argv[2];
const balanceStr = process.argv[3];

if (!companyName || !balanceStr) {
  console.error(
    '❌ Usage: tsx scripts/add-manual-wallet.ts "Company Name" <balance>'
  );
  console.error(
    '📝 Example: tsx scripts/add-manual-wallet.ts "MicroStrategy" 1000.5'
  );
  console.error('📝 Example: npm run add-manual-wallet "Tesla" 500');
  process.exit(1);
}

const balance = parseFloat(balanceStr);
if (isNaN(balance)) {
  console.error("❌ Balance must be a valid number");
  console.error("📝 Example: 1000.5 or 500");
  process.exit(1);
}

// Confirm this is running locally (basic check)
if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
  console.error("❌ This script can only be run locally, not in production!");
  process.exit(1);
}

console.log("🏠 Running in local environment");
console.log("⚠️  This will add a manual wallet entry to the database");

// Run the script
addManualWallet(companyName, balance).catch((error) => {
  console.error("❌ Unhandled error:", error);
  process.exit(1);
});
