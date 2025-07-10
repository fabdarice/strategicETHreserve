interface AlphaVantageResponse {
  MarketCapitalization?: string;
  Symbol?: string;
  [key: string]: any;
}

export async function fetchMarketCap(ticker: string): Promise<number | null> {
  const apiKey = process.env.ALPHAVANTAGE_API_KEY;

  if (!apiKey) {
    console.error("ALPHAVANTAGE_API_KEY not found in environment variables");
    return null;
  }

  const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${apiKey}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Strategic ETH Reserve",
      },
    });

    if (!response.ok) {
      console.error(`API request failed with status: ${response.status}`);
      return null;
    }

    const data: AlphaVantageResponse = await response.json();

    if (data.MarketCapitalization) {
      // Convert market cap string to number (remove commas and convert to float)
      const marketCapStr = data.MarketCapitalization.replace(/,/g, "");
      const marketCap = parseFloat(marketCapStr);

      if (isNaN(marketCap)) {
        console.error(
          `Invalid market cap value for ${ticker}: ${data.MarketCapitalization}`
        );
        return null;
      }

      return marketCap;
    }

    console.warn(`No market cap data found for ticker: ${ticker}`);
    return null;
  } catch (error) {
    console.error(`Error fetching market cap for ${ticker}:`, error);
    return null;
  }
}
