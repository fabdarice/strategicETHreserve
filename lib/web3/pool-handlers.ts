import { Alchemy } from "alchemy-sdk";
import type { PoolHandlerResult, PoolHandlerType } from "./types";
import { FUNCTION_SELECTORS } from "./abis";

// ===== ABSTRACT BASE CLASS =====
export abstract class PoolHandler {
  protected alchemy: Alchemy;
  protected ethTokens: string[];

  constructor(alchemy: Alchemy, ethTokens: string[]) {
    this.alchemy = alchemy;
    this.ethTokens = ethTokens;
  }

  abstract getETHAmount(
    poolAddress: string,
    lpBalance: bigint,
    walletAddress: string
  ): Promise<PoolHandlerResult>;

  protected isETHRelated(tokenAddress: string): boolean {
    return this.ethTokens.some(
      (ethToken) => ethToken.toLowerCase() === tokenAddress.toLowerCase()
    );
  }
}

// ===== UNISWAP V2 HANDLER =====
export class UniswapV2Handler extends PoolHandler {
  async getETHAmount(
    poolAddress: string,
    lpBalance: bigint,
    walletAddress: string
  ): Promise<PoolHandlerResult> {
    try {
      const [
        reservesResponse,
        token0Response,
        token1Response,
        totalSupplyResponse,
      ] = await Promise.all([
        this.alchemy.core.call({
          to: poolAddress,
          data: FUNCTION_SELECTORS.getReserves,
        }),
        this.alchemy.core.call({
          to: poolAddress,
          data: FUNCTION_SELECTORS.token0,
        }),
        this.alchemy.core.call({
          to: poolAddress,
          data: FUNCTION_SELECTORS.token1,
        }),
        this.alchemy.core.call({
          to: poolAddress,
          data: FUNCTION_SELECTORS.totalSupply,
        }),
      ]);

      if (
        !reservesResponse ||
        !token0Response ||
        !token1Response ||
        !totalSupplyResponse
      ) {
        return { ethAmount: BigInt(0) };
      }

      const token0 = "0x" + token0Response.slice(-40);
      const token1 = "0x" + token1Response.slice(-40);
      const reserve0 = BigInt("0x" + reservesResponse.slice(2, 66));
      const reserve1 = BigInt("0x" + reservesResponse.slice(66, 130));
      const totalSupply = BigInt(totalSupplyResponse);

      const isToken0ETH = this.isETHRelated(token0);
      const isToken1ETH = this.isETHRelated(token1);

      if (!isToken0ETH && !isToken1ETH) {
        return { ethAmount: BigInt(0), token0, token1 };
      }

      let ethAmount = BigInt(0);
      if (isToken0ETH) {
        ethAmount = (reserve0 * lpBalance) / totalSupply;
      } else if (isToken1ETH) {
        ethAmount = (reserve1 * lpBalance) / totalSupply;
      }

      return { ethAmount, token0, token1 };
    } catch (error) {
      console.error(`Error processing Uniswap V2 pool ${poolAddress}:`, error);
      return { ethAmount: BigInt(0) };
    }
  }
}

// ===== UNISWAP V3 HANDLER =====
export class UniswapV3Handler extends PoolHandler {
  async getETHAmount(
    poolAddress: string,
    lpBalance: bigint,
    walletAddress: string
  ): Promise<PoolHandlerResult> {
    try {
      const [token0Response, token1Response, liquidityResponse] =
        await Promise.all([
          this.alchemy.core.call({
            to: poolAddress,
            data: FUNCTION_SELECTORS.token0,
          }),
          this.alchemy.core.call({
            to: poolAddress,
            data: FUNCTION_SELECTORS.token1,
          }),
          this.alchemy.core.call({
            to: poolAddress,
            data: FUNCTION_SELECTORS.liquidity,
          }),
        ]);

      if (!token0Response || !token1Response || !liquidityResponse) {
        return { ethAmount: BigInt(0) };
      }

      const token0 = "0x" + token0Response.slice(-40);
      const token1 = "0x" + token1Response.slice(-40);
      const poolLiquidity = BigInt(liquidityResponse);

      const isToken0ETH = this.isETHRelated(token0);
      const isToken1ETH = this.isETHRelated(token1);

      if (!isToken0ETH && !isToken1ETH) {
        return { ethAmount: BigInt(0), token0, token1 };
      }

      // For V3, we need to get the position's liquidity share
      // This is a simplified calculation - in practice, you'd need to track specific positions
      const ethAmount = (poolLiquidity * lpBalance) / BigInt(10 ** 18); // Simplified

      return { ethAmount, token0, token1 };
    } catch (error) {
      console.error(`Error processing Uniswap V3 pool ${poolAddress}:`, error);
      return { ethAmount: BigInt(0) };
    }
  }
}

// ===== UNISWAP V4 HANDLER =====
export class UniswapV4Handler extends PoolHandler {
  async getETHAmount(
    poolAddress: string,
    lpBalance: bigint,
    walletAddress: string
  ): Promise<PoolHandlerResult> {
    try {
      // Uniswap V4 implementation - placeholder for when V4 is live
      // V4 introduces hooks and custom pool logic
      return { ethAmount: BigInt(0) };
    } catch (error) {
      console.error(`Error processing Uniswap V4 pool ${poolAddress}:`, error);
      return { ethAmount: BigInt(0) };
    }
  }
}

// ===== AERODROME HANDLER =====
export class AerodromeHandler extends PoolHandler {
  async getETHAmount(
    poolAddress: string,
    lpBalance: bigint,
    walletAddress: string
  ): Promise<PoolHandlerResult> {
    // Aerodrome uses similar structure to Uniswap V2
    const uniV2Handler = new UniswapV2Handler(this.alchemy, this.ethTokens);
    return uniV2Handler.getETHAmount(poolAddress, lpBalance, walletAddress);
  }
}

// ===== FLUID DEX HANDLER =====
export class FluidDEXHandler extends PoolHandler {
  async getETHAmount(
    poolAddress: string,
    lpBalance: bigint,
    walletAddress: string
  ): Promise<PoolHandlerResult> {
    try {
      // Fluid DEX implementation - placeholder for actual implementation
      // Would need to be implemented based on Fluid DEX's specific contract structure
      return { ethAmount: BigInt(0) };
    } catch (error) {
      console.error(`Error processing Fluid DEX pool ${poolAddress}:`, error);
      return { ethAmount: BigInt(0) };
    }
  }
}

// ===== BALANCER HANDLER =====
export class BalancerHandler extends PoolHandler {
  async getETHAmount(
    poolAddress: string,
    lpBalance: bigint,
    walletAddress: string
  ): Promise<PoolHandlerResult> {
    try {
      // Balancer pools require different handling - this is a simplified version
      // Would need pool ID and call to Balancer Vault
      return { ethAmount: BigInt(0) };
    } catch (error) {
      console.error(`Error processing Balancer pool ${poolAddress}:`, error);
      return { ethAmount: BigInt(0) };
    }
  }
}

// ===== CURVE HANDLER =====
export class CurveHandler extends PoolHandler {
  async getETHAmount(
    poolAddress: string,
    lpBalance: bigint,
    walletAddress: string
  ): Promise<PoolHandlerResult> {
    try {
      // Curve pools have different ABI - this is a simplified version
      return { ethAmount: BigInt(0) };
    } catch (error) {
      console.error(`Error processing Curve pool ${poolAddress}:`, error);
      return { ethAmount: BigInt(0) };
    }
  }
}

// ===== POOL HANDLER FACTORY =====
export function createPoolHandler(
  poolType: PoolHandlerType,
  alchemy: Alchemy,
  ethTokens: string[]
): PoolHandler {
  switch (poolType) {
    case "UniswapV2":
      return new UniswapV2Handler(alchemy, ethTokens);
    case "UniswapV3":
      return new UniswapV3Handler(alchemy, ethTokens);
    case "UniswapV4":
      return new UniswapV4Handler(alchemy, ethTokens);
    case "Aerodrome":
      return new AerodromeHandler(alchemy, ethTokens);
    case "FluidDEX":
      return new FluidDEXHandler(alchemy, ethTokens);
    case "Balancer":
      return new BalancerHandler(alchemy, ethTokens);
    case "Curve":
      return new CurveHandler(alchemy, ethTokens);
    default:
      throw new Error(`Unsupported pool type: ${poolType}`);
  }
}
