import { fetchCompanyInfo } from "../lib/companyinfo";

async function testCompanyInfo() {
  console.log("🚀 Starting company info test...\n");

  // Get ticker from command line arguments or use default
  const ticker = process.argv[2] || "AAPL";

  if (!ticker) {
    console.error("❌ Please provide a ticker symbol");
    console.log("Usage: tsx scripts/test-marketcap.ts <ticker>");
    console.log("Example: tsx scripts/test-marketcap.ts AAPL");
    process.exit(1);
  }

  console.log(`🔍 Testing company info for ticker: ${ticker.toUpperCase()}`);
  console.log(
    "================================================================================"
  );
  console.log("🔄 Fetching company info data...\n");

  const startTime = Date.now();

  try {
    const companyInfo = await fetchCompanyInfo(ticker);
    const endTime = Date.now();
    const executionTime = endTime - startTime;

    console.log("📊 RESULTS:");

    if (
      companyInfo.marketCap !== null ||
      companyInfo.sharesOutstanding !== null
    ) {
      if (companyInfo.marketCap !== null) {
        console.log(
          `💰 Market Cap: $${companyInfo.marketCap.toLocaleString()}`
        );
        console.log(`🔢 Raw Market Cap: ${companyInfo.marketCap}`);
      }
      if (companyInfo.sharesOutstanding !== null) {
        console.log(
          `📈 Shares Outstanding: ${companyInfo.sharesOutstanding.toLocaleString()}`
        );
        console.log(
          `🔢 Raw Shares Outstanding: ${companyInfo.sharesOutstanding}`
        );
      }
      console.log(`📈 Ticker: ${ticker.toUpperCase()}`);
      console.log(`⏱️  Execution Time: ${executionTime}ms`);
      console.log("✅ Successfully retrieved company info data");
    } else {
      console.log(
        `❌ No company info data found for ticker: ${ticker.toUpperCase()}`
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

    console.error("❌ Error occurred during company info fetch:");
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
testCompanyInfo().catch((error) => {
  console.error("💥 Unexpected error:", error);
  process.exit(1);
});
