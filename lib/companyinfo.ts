interface AlphaVantageResponse {
  MarketCapitalization?: string;
  SharesOutstanding?: string;
  Symbol?: string;
  [key: string]: any;
}

export interface CompanyInfo {
  marketCap: number | null;
  sharesOutstanding: number | null;
}

export async function fetchCompanyInfo(ticker: string): Promise<CompanyInfo> {
  const apiKey = process.env.ALPHAVANTAGE_API_KEY;

  if (!apiKey) {
    console.error("ALPHAVANTAGE_API_KEY not found in environment variables");
    return { marketCap: null, sharesOutstanding: null };
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
      return { marketCap: null, sharesOutstanding: null };
    }

    const data: AlphaVantageResponse = await response.json();

    console.log(data);

    const result: CompanyInfo = {
      marketCap: null,
      sharesOutstanding: null,
    };

    // Parse market cap
    if (data.MarketCapitalization) {
      const marketCapStr = data.MarketCapitalization.replace(/,/g, "");
      const marketCap = parseFloat(marketCapStr);

      if (!isNaN(marketCap)) {
        result.marketCap = marketCap;
      } else {
        console.error(
          `Invalid market cap value for ${ticker}: ${data.MarketCapitalization}`
        );
      }
    }

    // Parse shares outstanding
    if (data.SharesOutstanding) {
      const sharesOutstandingStr = data.SharesOutstanding.replace(/,/g, "");
      const sharesOutstanding = parseFloat(sharesOutstandingStr);

      if (!isNaN(sharesOutstanding)) {
        result.sharesOutstanding = sharesOutstanding;
      } else {
        console.error(
          `Invalid shares outstanding value for ${ticker}: ${data.SharesOutstanding}`
        );
      }
    }

    if (result.marketCap === null && result.sharesOutstanding === null) {
      console.warn(`No company data found for ticker: ${ticker}`);
    }

    return result;
  } catch (error) {
    console.error(`Error fetching company info for ${ticker}:`, error);
    return { marketCap: null, sharesOutstanding: null };
  }
}
