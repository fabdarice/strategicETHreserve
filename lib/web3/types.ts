import { Network } from "alchemy-sdk";

// ===== CORE TYPES =====
export interface PoolDetail {
  network: string;
  poolAddress: string;
  poolType: string;
  ethAmount: bigint;
  lpTokenBalance: bigint;
  token0?: string;
  token1?: string;
}

export interface ETHBalanceResult {
  totalETHInPools: bigint;
  poolDetails: PoolDetail[];
}

export interface CompleteETHBalance {
  totalBalance: bigint;
  poolBalance: bigint;
  directBalance: bigint;
  poolDetails: PoolDetail[];
}

// ===== NETWORK TYPES =====
export interface NetworkConfig {
  name: string;
  value: Network;
}

export interface AlchemyInstance {
  name: string;
  alchemy: any; // Alchemy instance
  networkValue: Network;
}

// ===== POOL TYPES =====
export interface PoolConfig {
  address: string;
  type: string;
}

export interface PoolHandlerResult {
  ethAmount: bigint;
  token0?: string;
  token1?: string;
}

// ===== TOKEN TYPES =====
export interface TokenBalanceResponse {
  tokenBalances: Array<{
    contractAddress: string;
    tokenBalance: string;
    error?: string;
  }>;
}

// ===== POOL HANDLER TYPES =====
export type PoolHandlerType =
  | "UniswapV2"
  | "UniswapV3"
  | "UniswapV4"
  | "Aerodrome"
  | "FluidDEX"
  | "Balancer"
  | "Curve";

// ===== FUNCTION SELECTOR TYPES =====
export interface FunctionSelectors {
  getReserves: string;
  token0: string;
  token1: string;
  totalSupply: string;
  slot0: string;
  liquidity: string;
  balanceOf: string;
}
