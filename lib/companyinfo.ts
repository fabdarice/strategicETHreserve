import yahooFinance from "yahoo-finance2";

interface YahooFinanceQuote {
  symbol: string;
  marketCap?: number;
  sharesOutstanding?: number;
  [key: string]: any;
}

export interface CompanyInfo {
  marketCap: number | null;
  sharesOutstanding: number | null;
}

export async function fetchCompanyInfo(ticker: string): Promise<CompanyInfo> {
  const result: CompanyInfo = {
    marketCap: null,
    sharesOutstanding: null,
  };

  try {
    console.log(`Fetching company info for ticker: ${ticker}`);

    const quote = (await yahooFinance.quote(ticker)) as YahooFinanceQuote;

    if (!quote) {
      console.warn(`No data found for ticker: ${ticker}`);
      return result;
    }

    // Extract market cap
    if (quote.marketCap && typeof quote.marketCap === "number") {
      result.marketCap = quote.marketCap;
      console.log(`Market cap for ${ticker}: ${result.marketCap}`);
    } else {
      console.warn(`No market cap data found for ticker: ${ticker}`);
    }

    // Extract shares outstanding
    if (
      quote.sharesOutstanding &&
      typeof quote.sharesOutstanding === "number"
    ) {
      result.sharesOutstanding = quote.sharesOutstanding;
      console.log(
        `Shares outstanding for ${ticker}: ${result.sharesOutstanding}`
      );
    } else {
      console.warn(`No shares outstanding data found for ticker: ${ticker}`);
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
