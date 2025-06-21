import { Network } from "alchemy-sdk";
import { NetworkConfig, PoolConfig } from "./types";

// ===== ALCHEMY CONFIGURATION =====
export const alchemyConfig = {
  apiKey: process.env.ALCHEMY_SECRET_KEY,
};

// ===== NETWORK CONFIGURATION =====
export const networks: NetworkConfig[] = [
  { name: "Ethereum Mainnet", value: Network.ETH_MAINNET },
  { name: "Base Mainnet", value: Network.BASE_MAINNET },
  { name: "Optimism", value: Network.OPT_MAINNET },
  { name: "Arbitrum", value: Network.ARB_MAINNET },
  { name: "zkSync", value: Network.ZKSYNC_MAINNET },
  { name: "Linea", value: Network.LINEA_MAINNET },
  { name: "Gnosis", value: Network.GNOSIS_MAINNET },
  { name: "Arbitrum Nova", value: Network.ARBNOVA_MAINNET },
];

// ===== ETH-RELATED TOKENS FOR POOL DETECTION =====
export const ETH_RELATED_TOKENS: { [key: string]: string[] } = {
  [Network.ETH_MAINNET]: [
    "0x0000000000000000000000000000000000000000", // ETH (native)
    "0xC02aaA39b223FE8D0A0E5C4F27eAD9083C756Cc2", // WETH
    "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84", // stETH
    "0xae78736Cd615f374D3085123A210448E74Fc6393", // rETH
    "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0", // wstETH
  ],
  [Network.BASE_MAINNET]: [
    "0x0000000000000000000000000000000000000000", // ETH (native)
    "0x4200000000000000000000000000000000000006", // WETH
    "0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452", // wstETH
  ],
  [Network.ARB_MAINNET]: [
    "0x0000000000000000000000000000000000000000", // ETH (native)
    "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", // WETH
    "0x5979D7b546E38E414F7E9822514be443A4800529", // wstETH
    "0xEC70Dcb4A1EFa46b8F2D97C310C9c4790ba5ffA8", // rETH
  ],
  [Network.OPT_MAINNET]: [
    "0x0000000000000000000000000000000000000000", // ETH (native)
    "0x4200000000000000000000000000000000000006", // WETH
    "0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb", // wstETH
  ],
  [Network.GNOSIS_MAINNET]: [
    "0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1", // WETH
    "0x6C76971f98945AE98dD7d4DFcA8711ebea946eA6", // wstETH
    "0xc791240D1F2dEf5938E2031364Ff4ed887133C3d", // rETH
  ],
};

// ===== ERC20 TOKENS FOR DIRECT BALANCE CHECKING =====
export const tokensPerNetwork: {
  [key: string]: {
    stETH?: string;
    wstETH?: string;
    rETH?: string;
    WETH?: string;
    aEthWETH?: string;
    aEthwstETH?: string;
    aEthweETH?: string;
    oETH?: string;
    ankrETH?: string;
    ETHx?: string;
    aGnowstETH?: string;
    aGnowWETH?: string;
    auraBrETHSTABLEvault?: string;
    aurawstETHWETHBPTvault?: string;
    ostETHwETHBPT?: string;
    rsETH?: string;
    eETH?: string;
    weETH?: string;
    armWETHstETH?: string;
    dWSTETHV3?: string;
    cmETH?: string;
    mETH?: string;
    aBasWETH?: string;
    aBaswstETH?: string;
    aArbWETH?: string;
    aArbweETH?: string;
    aArbwstETH?: string;
    aArbrETH?: string;
    aEthsrETH?: string;
    aEthosETH?: string;
    osETH?: string;
    aEthrETH?: string;
    aEthETHX?: string;
    aOptWETH?: string;
    aOptwstETH?: string;
    spwstETH?: string;
    cWETHv3?: string;
    aEthLidoWETH?: string;
    spWETH?: string;
    brETHStable?: string;
    dsTVL?: string;
    sfrxETH?: string;
    frxETH?: string;
  };
} = {
  [Network.ETH_MAINNET]: {
    stETH: "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84",
    rETH: "0xae78736Cd615f374D3085123A210448E74Fc6393",
    WETH: "0xC02aaA39b223FE8D0A0E5C4F27eAD9083C756Cc2",
    aEthWETH: "0x4d5F47FA6A74757f35C14fD3a6Ef8E3C9BC514E8",
    aEthwstETH: "0x0B925eD163218f6662a35e0f0371Ac234f9E9371",
    aEthweETH: "0xBdfa7b7893081B35Fb54027489e2Bc7A38275129",
    wstETH: "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0",
    oETH: "0x856c4Efb76C1D1AE02e20CEB03A2A6a08b0b8dC3",
    ankrETH: "0xE95A203B1a91a908F9B9CE46459d101078c2c3cb",
    ETHx: "0xA35b1B31Ce002FBF2058D22F30f95D405200A15b",
    auraBrETHSTABLEvault: "0xDd1fE5AD401D4777cE89959b7fa587e569Bf125D",
    aurawstETHWETHBPTvault: "0x2a14dB8D09dB0542f6A371c0cB308A768227D67D",
    ostETHwETHBPT: "0xc592c33e51A764B94DB0702D8BAf4035eD577aED",
    rsETH: "0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7",
    aEthsrETH: "0x2D62109243b87C4bA3EE7bA1D91B0dD0A074d7b1",
    eETH: "0x35fA164735182de50811E8e2E824cFb9B6118ac2",
    weETH: "0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee",
    armWETHstETH: "0x85B78AcA6Deae198fBF201c82DAF6Ca21942acc6",
    dWSTETHV3: "0xFF94993fA7EA27Efc943645F95Adb36C1b81244b",
    aEthosETH: "0x927709711794F3De5DdBF1D176bEE2D55Ba13c21",
    osETH: "0xf1C9acDc66974dFB6dEcB12aA385b9cD01190E38",
    aEthrETH: "0xCc9EE9483f662091a1de4795249E24aC0aC2630f",
    aEthETHX: "0x1c0E06a0b1A4c160c17545FF2A951bfcA57C0002",
    spwstETH: "0x12B54025C112Aa61fAce2CDB7118740875A566E9",
    cWETHv3: "0xA17581A9E3356d9A858b789D68B4d866e593aE94",
    aEthLidoWETH: "0xfA1fDbBD71B0aA16162D76914d69cD8CB3Ef92da",
    spWETH: "0x59cD1C87501baa753d0B5B5Ab5D8416A45cD71DB",
    brETHStable: "0x1E19CF2D73a72Ef1332C882F20534B6519Be0276",
    dsTVL: "0x1ce8aAfb51e79F6BDc0EF2eBd6fD34b00620f6dB",
    frxETH: "0x5E8422345238F34275888049021821E8E08CAa1f",
    sfrxETH: "0xac3E018457B222d93114458476f3E3416Abbe38F",
  },
  [Network.BASE_MAINNET]: {
    wstETH: "0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452",
    WETH: "0x4200000000000000000000000000000000000006",
    aBasWETH: "0xD4a0e0b9149BCee3C920d2E00b5dE09138fd8bb7",
    aBaswstETH: "0x99CBC45ea5bb7eF3a5BC08FB1B7E56bB2442Ef0D",
  },
  [Network.ARB_MAINNET]: {
    wstETH: "0x5979D7b546E38E414F7E9822514be443A4800529",
    WETH: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    aArbWETH: "0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8",
    weETH: "0x35751007a407ca6FEFfE80b3cB397736D2cf4dbe",
    aArbweETH: "0x8437d7C167dFB82ED4Cb79CD44B7a32A1dd95c77",
    aArbwstETH: "0x513c7E3a9c69cA3e22550eF58AC1C0088e918FFf",
    rETH: "0xEC70Dcb4A1EFa46b8F2D97C310C9c4790ba5ffA8",
    aArbrETH: "0x8Eb270e296023E9D92081fdF967dDd7878724424",
  },
  [Network.OPT_MAINNET]: {
    wstETH: "0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb",
    WETH: "0x4200000000000000000000000000000000000006",
    aOptWETH: "0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8",
    aOptwstETH: "0xc45A479877e1e9Dfe9FcD4056c699575a1045dAA",
  },
  [Network.GNOSIS_MAINNET]: {
    WETH: "0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1",
    aGnowstETH: "0x23e4E76D01B2002BE436CE8d6044b0aA2f68B68a",
    aGnowWETH: "0xa818F1B57c201E092C4A2017A91815034326Efd1",
    wstETH: "0x6C76971f98945AE98dD7d4DFcA8711ebea946eA6",
    rETH: "0xc791240D1F2dEf5938E2031364Ff4ed887133C3d",
  },
  [Network.MANTLE_MAINNET]: {
    cmETH: "0xe6829d9a7ee3040e1276fa75293bde931859e8fa",
    mETH: "0xcda86a272531e8640cd7f1a92c01839911b90bb0",
  },
};

// ===== KNOWN POOL ADDRESSES =====
export const KNOWN_ETH_POOLS: { [key: string]: PoolConfig[] } = {
  [Network.ETH_MAINNET]: [
    // Uniswap V2
    {
      address: "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc",
      type: "UniswapV2",
    }, // USDC/WETH
    {
      address: "0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11",
      type: "UniswapV2",
    }, // DAI/WETH

    // Uniswap V3
    {
      address: "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640",
      type: "UniswapV3",
    }, // USDC/WETH 0.05%
    {
      address: "0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8",
      type: "UniswapV3",
    }, // USDC/WETH 0.3%
    {
      address: "0xC2e9F25Be6257c210d7Adf0D4Cd6E3E881ba25f8",
      type: "UniswapV3",
    }, // DAI/WETH 0.3%
  ],
  [Network.BASE_MAINNET]: [
    // Uniswap V3 on Base
    {
      address: "0xd0b53D9277642d899DF5C87A3966A349A798F224",
      type: "UniswapV3",
    }, // WETH/USDC
  ],
  [Network.ARB_MAINNET]: [
    // Uniswap V3 on Arbitrum
    {
      address: "0xC31E54c7a869B9FcBEcc14363CF510d1c41fa443",
      type: "UniswapV3",
    }, // WETH/USDC
  ],
};

// ===== API ENDPOINTS =====
export const API_ENDPOINTS = {
  BEACON_CHAIN: "https://beaconcha.in/api/v1/validator/withdrawalCredentials",
  COINMARKETCAP: process.env.COINMARKETCAP_API_URL,
} as const;

// ===== CONSTANTS =====
export const CONSTANTS = {
  ETH_PER_VALIDATOR: "32", // ETH staked per validator
  ZERO_ADDRESS: "0x0000000000000000000000000000000000000000",
  ZERO_BALANCE:
    "0x0000000000000000000000000000000000000000000000000000000000000000",
  VALIDATOR_FETCH_LIMIT: 200, // Maximum validators per API request
} as const;
