const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const mockCompanies = [
  {
    name: "Ethereum Foundation",
    category: "L1",
    description: "",
    currentReserve: 250000,
    commitmentPercentage: 0,
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Eth-diamond-rainbow.png",
    dateCommitment: new Date("2015-07-30"),
    status: "ACTIVE",
    website: "https://ethereum.org/",
    addresses: [],
  },
  {
    name: "Arbitrum",
    category: "L2",
    description: "",
    currentReserve: 20000,
    commitmentPercentage: 0,
    logo: "https://cryptologos.cc/logos/arbitrum-arb-logo.png",
    dateCommitment: new Date("2021-08-31"),
    addresses: [],
    status: "ACTIVE",
    website: "https://arbitrum.io/",
  },
];

const mockInfluencers = [
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
