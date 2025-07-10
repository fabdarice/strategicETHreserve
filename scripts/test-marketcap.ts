import { fetchMarketCap } from "../lib/marketcap";

async function testMarketCap() {
  console.log("🚀 Starting market cap test...\n");

  // Get ticker from command line arguments or use default
  const ticker = process.argv[2] || "AAPL";

  if (!ticker) {
    console.error("❌ Please provide a ticker symbol");
    console.log("Usage: tsx scripts/test-marketcap.ts <ticker>");
    console.log("Example: tsx scripts/test-marketcap.ts AAPL");
    process.exit(1);
  }

  console.log(`🔍 Testing market cap for ticker: ${ticker.toUpperCase()}`);
  console.log(
    "================================================================================"
  );
  console.log("🔄 Fetching market cap data...\n");

  const startTime = Date.now();

  try {
    const marketCap = await fetchMarketCap(ticker);
    const endTime = Date.now();
    const executionTime = endTime - startTime;

    console.log("📊 RESULTS:");

    if (marketCap !== null) {
      console.log(`💰 Market Cap: $${marketCap.toLocaleString()}`);
      console.log(`🔢 Raw Market Cap: ${marketCap}`);
      console.log(`📈 Ticker: ${ticker.toUpperCase()}`);
      console.log(`⏱️  Execution Time: ${executionTime}ms`);
      console.log("✅ Successfully retrieved market cap data");
    } else {
      console.log(
        `❌ No market cap data found for ticker: ${ticker.toUpperCase()}`
      );
      console.log(`⏱️  Execution Time: ${executionTime}ms`);
      console.log("ℹ️  This could mean:");
      console.log("   - Invalid ticker symbol");
      console.log("   - API rate limit reached");
      console.log("   - Network connectivity issues");
      console.log("   - Missing or invalid ALPHAVANTAGE_API_KEY");
    }

    console.log(
      "\n================================================================================"
    );
  } catch (error) {
    const endTime = Date.now();
    const executionTime = endTime - startTime;

    console.error("❌ Error occurred during market cap fetch:");
    console.error(error);
    console.log(`⏱️  Execution Time: ${executionTime}ms`);
    console.log("\n🔧 Troubleshooting:");
    console.log("   - Check your ALPHAVANTAGE_API_KEY environment variable");
    console.log("   - Verify your internet connection");
    console.log("   - Ensure the ticker symbol is valid");
    console.log("   - Check if you have reached API rate limits");
    process.exit(1);
  }
}

// Run the test
testMarketCap().catch((error) => {
  console.error("💥 Unexpected error:", error);
  process.exit(1);
});
