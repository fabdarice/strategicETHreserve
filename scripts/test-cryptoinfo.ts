import { fetchCryptoInfo } from "../lib/cryptoinfo";

async function testCryptoInfo() {
  console.log("🚀 Starting crypto info test...\n");

  // Get symbol from command line arguments or use default
  const symbol = process.argv[2] || "ETH";

  if (!symbol) {
    console.error("❌ Please provide a crypto symbol");
    console.log("Usage: tsx scripts/test-cryptoinfo.ts <symbol>");
    console.log("Example: tsx scripts/test-cryptoinfo.ts ETH");
    process.exit(1);
  }

  console.log(`🔍 Testing crypto info for symbol: ${symbol.toUpperCase()}`);
  console.log(
    "================================================================================"
  );
  console.log("🔄 Fetching crypto data...\n");

  const startTime = Date.now();

  try {
    const cryptoInfo = await fetchCryptoInfo(symbol);
    const endTime = Date.now();
    const executionTime = endTime - startTime;

    console.log("📊 RESULTS:");

    if (
      cryptoInfo.marketCap !== null ||
      cryptoInfo.price !== null ||
      cryptoInfo.name !== null
    ) {
      if (cryptoInfo.name !== null) {
        console.log(`🏷️  Name: ${cryptoInfo.name}`);
      }
      if (cryptoInfo.symbol !== null) {
        console.log(`🔤 Symbol: ${cryptoInfo.symbol}`);
      }
      if (cryptoInfo.price !== null) {
        console.log(`💲 Price: $${cryptoInfo.price.toLocaleString()}`);
        console.log(`🔢 Raw Price: ${cryptoInfo.price}`);
      }
      if (cryptoInfo.marketCap !== null) {
        console.log(`💰 Market Cap: $${cryptoInfo.marketCap.toLocaleString()}`);
        console.log(`🔢 Raw Market Cap: ${cryptoInfo.marketCap}`);
      }
      console.log(`⏱️  Execution Time: ${executionTime}ms`);
      console.log("✅ Successfully retrieved crypto data");
    } else {
      console.log(
        `❌ No crypto data found for symbol: ${symbol.toUpperCase()}`
      );
      console.log(`⏱️  Execution Time: ${executionTime}ms`);
      console.log("ℹ️  This could mean:");
      console.log("   - Invalid crypto symbol");
      console.log("   - API rate limit reached");
      console.log("   - Network connectivity issues");
      console.log("   - Missing or invalid COINMARKETCAP_API_KEY");
    }

    console.log(
      "\n================================================================================"
    );
  } catch (error) {
    const endTime = Date.now();
    const executionTime = endTime - startTime;

    console.error("❌ Error occurred during crypto info fetch:");
    console.error(error);
    console.log(`⏱️  Execution Time: ${executionTime}ms`);
    console.log("\n🔧 Troubleshooting:");
    console.log("   - Check your COINMARKETCAP_API_KEY environment variable");
    console.log("   - Verify your internet connection");
    console.log("   - Ensure the crypto symbol is valid");
    console.log("   - Check if you have reached API rate limits");
    process.exit(1);
  }
}

// Run the test
testCryptoInfo().catch((error) => {
  console.error("💥 Unexpected error:", error);
  process.exit(1);
});
