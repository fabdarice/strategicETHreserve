const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const mockCompanies = [
  {
    name: "Optimism",
    category: "L2",
    description: "Leading Ethereum L2 solution",
    commitmentPercentage: 20,
    currentReserve: 50000,
    logo: "https://cryptologos.cc/logos/optimism-ethereum-op-logo.png",
    dateCommitment: new Date("2024-01-01"),
    addresses: ["0x4200000000000000000000000000000000000006"],
  },
  {
    name: "Arbitrum",
    category: "L2",
    description: "Scaling solution for Ethereum",
    commitmentPercentage: 15,
    currentReserve: 45000,
    logo: "https://cryptologos.cc/logos/arbitrum-arb-logo.png",
    dateCommitment: new Date("2024-02-01"),
    addresses: ["0x912CE59144191C1204E64559FE8253a0e49E6548"],
  },
];

const mockInfluencers = [
  {
    name: "Vitalik Buterin",
    avatar:
      "https://images.unsplash.com/photo-1602992708529-c9fdb12905c9?auto=format&fit=crop&w=150&h=150",
    description: "Ethereum co-founder and researcher",
    commitment: "Building for the decentralized future",
    twitter: "vitalikbuterin",
  },
  {
    name: "Brantly Millegan",
    avatar:
      "https://pbs.twimg.com/profile_images/1583892551102251009/LMdBZzVS_400x400.png",
    description: "Building @efp & @ethidkit",
    commitment:
      "SERs with staking are inevitable for both companies and countries.",
    twitter: "BrantlyMillegan",
  },
];

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data
  await prisma.company.deleteMany();
  await prisma.influencer.deleteMany();

  // Seed companies
  for (const company of mockCompanies) {
    await prisma.company.create({
      data: company,
    });
  }
  console.log("✅ Companies seeded");

  // Seed influencers
  for (const influencer of mockInfluencers) {
    await prisma.influencer.create({
      data: influencer,
    });
  }
  console.log("✅ Influencers seeded");

  console.log("🌱 Seed completed");
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
