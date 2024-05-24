import { Chain, CurrentConfig } from '../config'

// Chains
const MAINNET_CHAIN_ID = 1
const POLYGON_CHAIN_ID = 137
const ARBITRUM_CHAIN_ID = 42161
const BNB_CHAIN_ID = 56
const BLAST_CHAIN = 81457
const BASE_CHAIN = 8453
const AVAX_CHAIN = 43114
const CELO_CHAIN = 42220
const ZORA_CHAIN = 7777777

export const INPUT_CHAIN_ID = CurrentConfig.chain === Chain.POLYGON ? POLYGON_CHAIN_ID : MAINNET_CHAIN_ID
export const INPUT_CHAIN_URL =
  CurrentConfig.chain === Chain.POLYGON ? CurrentConfig.rpc.polygon : CurrentConfig.rpc.mainnet

export const CHAIN_TO_URL_MAP = {
  [POLYGON_CHAIN_ID]: CurrentConfig.rpc.polygon,
  [MAINNET_CHAIN_ID]: CurrentConfig.rpc.mainnet,
  [ARBITRUM_CHAIN_ID]: CurrentConfig.rpc.arbitrum,
}

type ChainInfo = {
  explorer: string
  label: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: 18
  }
  rpcUrl: string
}

export const CHAIN_INFO: { [key: string]: ChainInfo } = {
  [MAINNET_CHAIN_ID]: {
    explorer: 'https://etherscan.io/',
    label: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrl: CurrentConfig.rpc.mainnet,
  },
  [POLYGON_CHAIN_ID]: {
    explorer: 'https://polygonscan.com/',
    label: 'Polygon',
    nativeCurrency: { name: 'Polygon Matic', symbol: 'MATIC', decimals: 18 },
    rpcUrl: CurrentConfig.rpc.polygon,
  },
  [ARBITRUM_CHAIN_ID]: {
    explorer: 'https://arbiscan.io/',
    label: 'Arbitrum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrl: CurrentConfig.rpc.arbitrum,
  },
  [BNB_CHAIN_ID]: {
    explorer: 'https://bscscan.com/',
    label: 'Binance Smart Chain',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    rpcUrl: CurrentConfig.rpc.bsc,
  },
  [BLAST_CHAIN]: {
    explorer: 'https://explorer.blastswap.org/',
    label: 'Blast Chain',
    nativeCurrency: { name: 'BLAST', symbol: 'BLAST', decimals: 18 },
    rpcUrl: CurrentConfig.rpc.blast,
  },
  [BASE_CHAIN]: {
    explorer: 'https://basescan.org/',
    label: 'BASE Chain',
    nativeCurrency: { name: 'BASE', symbol: 'BASE', decimals: 18 },
    rpcUrl: CurrentConfig.rpc.base,
  },
  [AVAX_CHAIN]: {
    explorer: 'https://basescan.org/',
    label: 'AVAX Chain',
    nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
    rpcUrl: CurrentConfig.rpc.base,
  },
  [CELO_CHAIN]: {
    explorer: 'https://basescan.org/',
    label: 'CELO Chain',
    nativeCurrency: { name: 'CELO', symbol: 'BASE', decimals: 18 },
    rpcUrl: CurrentConfig.rpc.base,
  },
  [ZORA_CHAIN]: {
    explorer: 'https://basescan.org/',
    label: 'ZORA Chain',
    nativeCurrency: { name: 'Ether', symbol: 'Ether', decimals: 18 },
    rpcUrl: CurrentConfig.rpc.base,
  },
}

// URLs
export const METAMASK_URL = 'https://metamask.io/'

export enum TOKEN_NAMES {
  USDT,
  WETH,
  UNI,
  WBTC,
  PEPE,
  MATIC,
  SHIB,
}

export const TOKENS = {
  [TOKEN_NAMES.USDT]: {
    address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    decimals: 6,
  },
  [TOKEN_NAMES.WETH]: {
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    decimals: 18,
  },
  [TOKEN_NAMES.WBTC]: {
    address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    decimals: 8,
  },
  [TOKEN_NAMES.UNI]: {
    address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    decimals: 18,
  },
  [TOKEN_NAMES.MATIC]: {
    address: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
    decimals: 18,
  },
  [TOKEN_NAMES.PEPE]: {
    address: '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
    decimals: 18,
  },
  [TOKEN_NAMES.SHIB]: {
    address: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce',
    decimals: 18,
  },
}
