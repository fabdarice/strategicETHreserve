import { Alchemy, Network } from "alchemy-sdk";
import { parseEther } from "viem";

const config = {
  apiKey: process.env.ALCHEMY_SECRET_KEY,
};

const networks = [
  { name: "Ethereum Mainnet", value: Network.ETH_MAINNET },
  { name: "Base Mainnet", value: Network.BASE_MAINNET },
  { name: "Optimism", value: Network.OPT_MAINNET },
  { name: "Arbitrum", value: Network.ARB_MAINNET },
  { name: "zkSync", value: Network.ZKSYNC_MAINNET },
  { name: "Linea", value: Network.LINEA_MAINNET },
  { name: "Gnosis", value: Network.GNOSIS_MAINNET },
];

// Define the ERC20 tokens to include with their contract addresses per network
const tokensPerNetwork: {
  [key: string]: {
    stETH?: string; // Lido ETH
    wstETH?: string; // wrapped Lido ETH
    rETH?: string; // Rocket Pool ETH
    WETH?: string; // Wrapped ETH
    aEthWETH?: string; // Aave Wrapped ETH
    aEthwstETH?: string;
    aEthweETH?: string;
    oETH?: string; // Origin ETH
    ankrETH?: string; // Ankr ETH
    ETHx?: string; // ETHx
    aGnowstETH?: string; // Aave Gnosis wstETH
    aGnowWETH?: string; // Aave Gnosis WETH
  };
} = {
  [Network.ETH_MAINNET]: {
    stETH: "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84", // Lido stETH
    rETH: "0xae78736Cd615f374D3085123A210448E74Fc6393", // Rocket Pool rETH
    WETH: "0xC02aaA39b223FE8D0A0E5C4F27eAD9083C756Cc2", // WETH
    aEthWETH: "0x4d5F47FA6A74757f35C14fD3a6Ef8E3C9BC514E8", // Aave WETH
    aEthwstETH: "0x0B925eD163218f6662a35e0f0371Ac234f9E9371", // Aave Lido stETH
    aEthweETH: "0xBdfa7b7893081B35Fb54027489e2Bc7A38275129", // Aave EtherFI ETH
    wstETH: "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0", // Lido wstETH
    oETH: "0x856c4Efb76C1D1AE02e20CEB03A2A6a08b0b8dC3", // Origin ETH
    ankrETH: "0x8290333ceF9e6D528dD5618Fb97a76f268f3edd3", // Ankr ETH
    ETHx: "0xA35b1B31Ce002FBF2058D22F30f95D405200A15b", // ETHx
  },
  [Network.BASE_MAINNET]: {
    wstETH: "0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452", // lido wstETH
    WETH: "0x4200000000000000000000000000000000000006",
  }, // Add tokens for Base
  [Network.ARB_MAINNET]: {
    wstETH: "0x5979D7b546E38E414F7E9822514be443A4800529", // lido wstETH
    WETH: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  }, // Add tokens for Arbitrum
  [Network.OPT_MAINNET]: {
    wstETH: "0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb", // lido wstETH
    WETH: "0x4200000000000000000000000000000000000006",
  }, // Add tokens for OP
  [Network.GNOSIS_MAINNET]: {
    WETH: "0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1", // Gnosis WETH
    aGnowstETH: "0x23e4E76D01B2002BE436CE8d6044b0aA2f68B68a", // Aave Gnosis wstETH
    aGnowWETH: "0xa818F1B57c201E092C4A2017A91815034326Efd1", // Aave Gnosis WETH
    wstETH: "0x6C76971f98945AE98dD7d4DFcA8711ebea946eA6", // lido wstETH
    rETH: "0xc791240D1F2dEf5938E2031364Ff4ed887133C3d", // Rocket Pool rETH
  }, // Add tokens for Gnosis
};

export const getETHBalanceAllNetworks = async (
  walletAddress: string
): Promise<bigint> => {
  const alchemyInstances = networks.map(({ name, value }) => ({
    name,
    alchemy: new Alchemy({
      ...config,
      network: value,
    }),
    networkValue: value,
  }));

  try {
    const balances = await Promise.all(
      alchemyInstances.map(async ({ name, alchemy, networkValue }) => {
        // Fetch native ETH balance
        const nativeBalance = await alchemy.core.getBalance(walletAddress);
        const nativeBalanceBigInt = BigInt(nativeBalance.toString());

        // Fetch ERC20 token balances
        const tokenAddresses = Object.values(
          tokensPerNetwork[networkValue] || {}
        ).filter((addr) => addr !== "0x...");
        let tokenBalancesBigInt: bigint = BigInt(0);

        if (tokenAddresses.length > 0) {
          const tokenBalancesResponse = await alchemy.core.getTokenBalances(
            walletAddress,
            tokenAddresses
          );

          // Iterate through each token balance and sum them
          tokenBalancesResponse.tokenBalances.forEach((token) => {
            if (
              token &&
              token.tokenBalance &&
              token.tokenBalance !==
                "0x0000000000000000000000000000000000000000000000000000000000000000"
            ) {
              tokenBalancesBigInt += BigInt(token.tokenBalance);
            }
          });
        }

        // Total ETH-equivalent balance for this network
        const totalNetworkBalance = nativeBalanceBigInt + tokenBalancesBigInt;

        return { name, balance: totalNetworkBalance };
      })
    );

    // Aggregate and display balances
    let totalBalance = BigInt(0);
    balances.forEach(({ name, balance }) => {
      totalBalance += balance;
    });

    const validatorBalance = await getValidatorBalance(walletAddress);

    return totalBalance + validatorBalance;
  } catch (error) {
    console.error("getETHBalanceAllNetworks error", error);
    throw error;
  }
};

export const getValidatorBalance = async (
  walletAddress: string
): Promise<bigint> => {
  const limit = 200; // Maximum number of validators per API request
  let offset = 0; // Pagination offset
  let totalValidators = 0; // Total count of validators

  const baseUrl = "https://beaconcha.in/api/v1/validator/withdrawalCredentials";

  try {
    while (true) {
      const url = `${baseUrl}/${walletAddress}?limit=${limit}&offset=${offset}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();

      // Verify the API status
      if (json.status !== "OK") {
        throw new Error(`API error! status: ${json.status}`);
      }

      const data = json.data;

      // Increment the total validators count
      totalValidators += data.length;

      // If fewer validators are returned than the limit, we've fetched all data
      if (data.length < limit) {
        break;
      }

      // Move to the next page
      offset += limit;
    }

    // Calculate total ETH staked: 32 ETH per validator
    const totalEth = parseEther("32") * BigInt(totalValidators);

    return totalEth;
  } catch (error) {
    console.error("Error fetching validators:", error);
    throw error; // Rethrow the error after logging
  }
};

export const getETHPrice = async (): Promise<number> => {
  if (
    process.env.COINMARKETCAP_API_URL === undefined ||
    process.env.COINMARKETCAP_API_KEY === undefined
  ) {
    throw new Error("Environments to fetch ETH prices not set");
  }

  try {
    const response = await fetch(process.env.COINMARKETCAP_API_URL, {
      method: "GET",
      headers: {
        "X-CMC_PRO_API_KEY": process.env.COINMARKETCAP_API_KEY,
      },
    });
    if (response.status !== 200) throw new Error("Failed to fetch ETH Price");

    const jsonData = await response.json();
    const price = Math.floor(jsonData.data.ETH[0].quote.USD.price);

    return price as number;
  } catch (error) {
    console.error(error);
    throw new Error("Failed fetching ETH price");
  }
};
