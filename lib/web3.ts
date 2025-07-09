import { Alchemy, Network } from "alchemy-sdk";
import { parseEther } from "viem";

// ===== IMPORTS =====
import type {
  PoolDetail,
  ETHBalanceResult,
  CompleteETHBalance,
  AlchemyInstance,
  PoolHandlerType,
} from "./web3/types";

import {
  alchemyConfig,
  networks,
  ETH_RELATED_TOKENS,
  tokensPerNetwork,
  KNOWN_ETH_POOLS,
  API_ENDPOINTS,
  CONSTANTS,
} from "./web3/config";

import { createPoolHandler } from "./web3/pool-handlers";

// ===== UTILITY FUNCTIONS =====
function createAlchemyInstances(): AlchemyInstance[] {
  return networks.map(({ name, value }) => ({
    name,
    alchemy: new Alchemy({ ...alchemyConfig, network: value }),
    networkValue: value,
  }));
}

function isZeroBalance(balance: string | undefined): boolean {
  return !balance || balance === CONSTANTS.ZERO_BALANCE;
}

// ===== MAIN FUNCTIONS =====

/**
 * Get ETH balance across all networks (direct holdings only)
 */
export const getETHBalanceAllNetworks = async (
  walletAddress: string
): Promise<bigint> => {
  const alchemyInstances = createAlchemyInstances();

  try {
    const balances = await Promise.all(
      alchemyInstances.map(async ({ name, alchemy, networkValue }) => {
        // Native ETH balance
        let nativeBalance = BigInt(0);
        if (
          networkValue !== Network.GNOSIS_MAINNET &&
          networkValue !== Network.MANTLE_MAINNET
        ) {
          const balance = await alchemy.core.getBalance(walletAddress);
          nativeBalance = BigInt(balance.toString());
        }

        // ERC20 token balances
        const tokenAddresses = Object.values(
          tokensPerNetwork[networkValue] || {}
        ).filter((addr) => addr && addr !== "0x...");

        let tokenBalancesBigInt = BigInt(0);
        if (tokenAddresses.length > 0) {
          const tokenBalancesResponse = await alchemy.core.getTokenBalances(
            walletAddress,
            tokenAddresses
          );

          tokenBalancesResponse.tokenBalances.forEach((token: any) => {
            if (!isZeroBalance(token?.tokenBalance)) {
              tokenBalancesBigInt += BigInt(token.tokenBalance!);
            }
          });
        }

        return nativeBalance + tokenBalancesBigInt;
      })
    );

    const totalBalance = balances.reduce(
      (sum, balance) => sum + balance,
      BigInt(0)
    );
    const validatorBalance = await getValidatorBalance(walletAddress);

    return totalBalance + validatorBalance;
  } catch (error) {
    console.error("getETHBalanceAllNetworks error", error);
    throw error;
  }
};

/**
 * Get validator balance from Ethereum beacon chain
 */
export const getValidatorBalance = async (
  walletAddress: string
): Promise<bigint> => {
  const limit = CONSTANTS.VALIDATOR_FETCH_LIMIT;
  let offset = 0;
  const allValidators: { publickey: string; validatorindex: number }[] = [];

  try {
    // First, get all validators
    while (true) {
      const url = `${API_ENDPOINTS.BEACON_CHAIN}/${walletAddress}?limit=${limit}&offset=${offset}`;
      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();
      if (json.status !== "OK") {
        throw new Error(`API error! status: ${json.status}`);
      }

      const data = json.data;
      allValidators.push(...data);

      if (data.length < limit) break;
      offset += limit;
    }

    // Now fetch balance history for each validator and sum effective balances
    const baseUrl = API_ENDPOINTS.BEACON_CHAIN.replace(
      "/api/v1/validator/withdrawalCredentials",
      ""
    );
    let totalEffectiveBalance = BigInt(0);

    for (const validator of allValidators) {
      try {
        const balanceUrl = `${baseUrl}/api/v1/validator/${validator.publickey}`;
        const balanceResponse = await fetch(balanceUrl, {
          method: "GET",
          headers: { Accept: "application/json" },
        });

        if (!balanceResponse.ok) {
          console.warn(
            `Failed to fetch balance for validator ${validator.publickey}: ${balanceResponse.status}`
          );
          continue;
        }

        const balanceJson = await balanceResponse.json();
        if (balanceJson.status !== "OK") {
          console.warn(
            `API error for validator ${validator.publickey}: ${balanceJson.status}`
          );
          continue;
        }

        // Sum all effective balances for this validator
        const validatorBalance = balanceJson.data;
        totalEffectiveBalance +=
          BigInt(validatorBalance.effectivebalance) * BigInt(10 ** 9);
      } catch (error) {
        console.error(
          `Error fetching balance history for validator ${validator.publickey}:`,
          error
        );
        // Continue with other validators even if one fails
      }
    }

    return totalEffectiveBalance;
  } catch (error) {
    console.error("Error fetching validators:", error);
    throw error;
  }
};

/**
 * Get current ETH price in USD
 */
export const getETHPrice = async (): Promise<number> => {
  if (!API_ENDPOINTS.COINMARKETCAP || !process.env.COINMARKETCAP_API_KEY) {
    throw new Error("Environments to fetch ETH prices not set");
  }

  try {
    const response = await fetch(API_ENDPOINTS.COINMARKETCAP, {
      method: "GET",
      headers: { "X-CMC_PRO_API_KEY": process.env.COINMARKETCAP_API_KEY },
    });

    if (response.status !== 200) {
      throw new Error("Failed to fetch ETH Price");
    }

    const jsonData = await response.json();
    return Math.floor(jsonData.data.ETH[0].quote.USD.price);
  } catch (error) {
    console.error(error);
    throw new Error("Failed fetching ETH price");
  }
};

/**
 * Detect and retrieve ETH balances from liquidity pools
 */
export const getETHPoolBalances = async (
  walletAddress: string
): Promise<ETHBalanceResult> => {
  const alchemyInstances = createAlchemyInstances();
  let totalETHInPools = BigInt(0);
  const poolDetails: PoolDetail[] = [];

  try {
    for (const { name, alchemy, networkValue } of alchemyInstances) {
      const knownPools = KNOWN_ETH_POOLS[networkValue] || [];
      const ethTokens = ETH_RELATED_TOKENS[networkValue] || [];

      for (const { address: poolAddress, type: poolType } of knownPools) {
        try {
          // Get LP token balance
          const lpBalance = await alchemy.core.getTokenBalances(walletAddress, [
            poolAddress,
          ]);
          const lpTokenBalance = lpBalance.tokenBalances[0]?.tokenBalance;

          if (isZeroBalance(lpTokenBalance)) {
            continue;
          }

          const lpBalanceBigInt = BigInt(lpTokenBalance!);

          // Create appropriate handler and get ETH amount
          const handler = createPoolHandler(
            poolType as PoolHandlerType,
            alchemy,
            ethTokens
          );
          const { ethAmount, token0, token1 } = await handler.getETHAmount(
            poolAddress,
            lpBalanceBigInt,
            walletAddress
          );

          if (ethAmount > 0) {
            totalETHInPools += ethAmount;
            poolDetails.push({
              network: name,
              poolAddress,
              poolType,
              ethAmount,
              lpTokenBalance: lpBalanceBigInt,
              token0,
              token1,
            });
          }
        } catch (error) {
          console.error(`Error processing pool ${poolAddress}:`, error);
        }
      }
    }

    return { totalETHInPools, poolDetails };
  } catch (error) {
    console.error("getETHPoolBalances error", error);
    throw error;
  }
};

/**
 * Check if a token address is ETH-related
 */
export const isETHRelatedToken = (
  tokenAddress: string,
  network: Network
): boolean => {
  const ethTokens = ETH_RELATED_TOKENS[network] || [];
  return ethTokens.some(
    (ethToken) => ethToken.toLowerCase() === tokenAddress.toLowerCase()
  );
};

/**
 * Get complete ETH balance including both direct holdings and pool positions
 */
export const getCompleteETHBalance = async (
  walletAddress: string
): Promise<CompleteETHBalance> => {
  try {
    const [directBalance, { totalETHInPools, poolDetails }] = await Promise.all(
      [
        getETHBalanceAllNetworks(walletAddress),
        getETHPoolBalances(walletAddress),
      ]
    );

    return {
      totalBalance: directBalance + totalETHInPools,
      poolBalance: totalETHInPools,
      directBalance,
      poolDetails,
    };
  } catch (error) {
    console.error("getCompleteETHBalance error", error);
    throw error;
  }
};
