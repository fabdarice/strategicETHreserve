export interface CryptoInfo {
  marketCap: number | null;
  price: number | null;
  name: string | null;
  symbol: string | null;
}

interface CoinMarketCapQuote {
  data: {
    [symbol: string]: {
      id: number;
      name: string;
      symbol: string;
      quote: {
        USD: {
          price: number;
          market_cap: number;
          [key: string]: any;
        };
      };
    };
  };
}

export async function fetchCryptoInfo(symbol: string): Promise<CryptoInfo> {
  const result: CryptoInfo = {
    marketCap: null,
    price: null,
    name: null,
    symbol: null,
  };

  try {
    console.log(`Fetching crypto info for symbol: ${symbol}`);

    const apiKey = process.env.COINMARKETCAP_API_KEY;
    if (!apiKey) {
      console.error("COINMARKETCAP_API_KEY environment variable is not set");
      return result;
    }

    const response = await fetch(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbol.toUpperCase()}`,
      {
        headers: {
          "X-CMC_PRO_API_KEY": apiKey,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return result;
    }

    const data = (await response.json()) as CoinMarketCapQuote;

    if (!data.data || !data.data[symbol.toUpperCase()]) {
      console.warn(`No data found for crypto symbol: ${symbol}`);
      return result;
    }

    const cryptoData = data.data[symbol.toUpperCase()];

    // Extract basic info
    result.name = cryptoData.name;
    result.symbol = cryptoData.symbol;

    // Extract market cap
    if (
      cryptoData.quote?.USD?.market_cap &&
      typeof cryptoData.quote.USD.market_cap === "number"
    ) {
      result.marketCap = cryptoData.quote.USD.market_cap;
      console.log(`Market cap for ${symbol}: ${result.marketCap}`);
    } else {
      console.warn(`No market cap data found for crypto: ${symbol}`);
    }

    // Extract price
    if (
      cryptoData.quote?.USD?.price &&
      typeof cryptoData.quote.USD.price === "number"
    ) {
      result.price = cryptoData.quote.USD.price;
      console.log(`Price for ${symbol}: ${result.price}`);
    } else {
      console.warn(`No price data found for crypto: ${symbol}`);
    }

    if (result.marketCap === null && result.price === null) {
      console.warn(`No crypto data found for symbol: ${symbol}`);
    }

    return result;
  } catch (error) {
    console.error(`Error fetching crypto info for ${symbol}:`, error);
    return { marketCap: null, price: null, name: null, symbol: null };
  }
}
