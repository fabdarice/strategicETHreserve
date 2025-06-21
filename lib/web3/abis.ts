import { FunctionSelectors } from "./types";

// ===== CONTRACT ABIs =====
export const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    type: "function",
  },
] as const;

export const UNISWAP_V2_PAIR_ABI = [
  {
    constant: true,
    inputs: [],
    name: "getReserves",
    outputs: [
      { name: "_reserve0", type: "uint112" },
      { name: "_reserve1", type: "uint112" },
      { name: "_blockTimestampLast", type: "uint32" },
    ],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "token0",
    outputs: [{ name: "", type: "address" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "token1",
    outputs: [{ name: "", type: "address" }],
    type: "function",
  },
] as const;

export const UNISWAP_V3_POOL_ABI = [
  {
    constant: true,
    inputs: [],
    name: "slot0",
    outputs: [
      { name: "sqrtPriceX96", type: "uint160" },
      { name: "tick", type: "int24" },
      { name: "observationIndex", type: "uint16" },
      { name: "observationCardinality", type: "uint16" },
      { name: "observationCardinalityNext", type: "uint16" },
      { name: "feeProtocol", type: "uint8" },
      { name: "unlocked", type: "bool" },
    ],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "liquidity",
    outputs: [{ name: "", type: "uint128" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "token0",
    outputs: [{ name: "", type: "address" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "token1",
    outputs: [{ name: "", type: "address" }],
    type: "function",
  },
] as const;

export const UNISWAP_V4_POOL_ABI = [
  // Uniswap V4 ABIs - to be implemented when V4 is live
  {
    constant: true,
    inputs: [],
    name: "slot0",
    outputs: [
      { name: "sqrtPriceX96", type: "uint160" },
      { name: "tick", type: "int24" },
      { name: "protocolFee", type: "uint24" },
      { name: "lpFee", type: "uint24" },
    ],
    type: "function",
  },
] as const;

export const BALANCER_VAULT_ABI = [
  {
    constant: true,
    inputs: [{ name: "poolId", type: "bytes32" }],
    name: "getPoolTokens",
    outputs: [
      { name: "tokens", type: "address[]" },
      { name: "balances", type: "uint256[]" },
      { name: "lastChangeBlock", type: "uint256" },
    ],
    type: "function",
  },
] as const;

export const CURVE_POOL_ABI = [
  {
    constant: true,
    inputs: [{ name: "i", type: "int128" }],
    name: "balances",
    outputs: [{ name: "", type: "uint256" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    type: "function",
  },
] as const;

export const AERODROME_PAIR_ABI = [
  // Aerodrome uses similar structure to Uniswap V2
  {
    constant: true,
    inputs: [],
    name: "getReserves",
    outputs: [
      { name: "_reserve0", type: "uint112" },
      { name: "_reserve1", type: "uint112" },
      { name: "_blockTimestampLast", type: "uint32" },
    ],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "token0",
    outputs: [{ name: "", type: "address" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "token1",
    outputs: [{ name: "", type: "address" }],
    type: "function",
  },
] as const;

export const FLUID_DEX_ABI = [
  // Fluid DEX ABIs - to be implemented based on their specific contract structure
  {
    constant: true,
    inputs: [],
    name: "getReserves",
    outputs: [
      { name: "reserve0", type: "uint256" },
      { name: "reserve1", type: "uint256" },
    ],
    type: "function",
  },
] as const;

// ===== FUNCTION SELECTORS =====
export const FUNCTION_SELECTORS: FunctionSelectors = {
  getReserves: "0x0902f1ac", // getReserves()
  token0: "0x0dfe1681", // token0()
  token1: "0xd21220a7", // token1()
  totalSupply: "0x18160ddd", // totalSupply()
  slot0: "0x3850c7bd", // slot0()
  liquidity: "0x1a686502", // liquidity()
  balanceOf: "0x70a08231", // balanceOf(address)
} as const;
