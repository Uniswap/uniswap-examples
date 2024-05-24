// Sets if the example should run locally or on chain
export enum Chain {
  POLYGON,
  MAINNET,
}

// Inputs that configure this example to run
interface ExampleConfig {
  chain: Chain
  rpc: {
    polygon: string
    mainnet: string
    arbitrum: string
    bsc: string
    blast: string
    base: string
    avax: string
    celo: string
    zora: string
  }
}

// Example Configuration
export const CurrentConfig: ExampleConfig = {
  chain: Chain.MAINNET,
  rpc: {
    polygon: 'https://polygon-mainnet.infura.io/v3/ddee64bef51f4b17b83aebdbff316876',
    mainnet: 'https://mainnet.infura.io/v3/ddee64bef51f4b17b83aebdbff316876',
    arbitrum: '',
    bsc: '',
    blast: '',
    base: '',
    avax: '',
    celo: '',
    zora: '',
  },
}
