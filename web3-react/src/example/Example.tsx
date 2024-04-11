import './Example.css'

import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { JsonRpcProvider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'

import { ConnectionOptions } from '../libs/components/ConnectionOptions'
import { ConnectionType, switchNetwork } from '../libs/connections'
import { INPUT_CHAIN_URL, TOKEN_NAMES, TOKENS } from '../libs/constants'
import FOT_ABI from './fot.json'

enum RoutingPreference {
  BEST_PRICE = 'BEST_PRICE',
  UNISWAPX = 'UNISWAPX',
  CLASSIC = 'CLASSIC',
  UNISWAPX_V2 = 'UNISWAPX_V2',
}

const FallbackComponent = ({ error }: FallbackProps) => {
  return (
    <div>
      <h1>An error occurred: {error.message}</h1>
      <p>Please reload the application</p>
    </div>
  )
}
// Listen for new blocks and update the wallet
const useOnBlockUpdated = (callback: (blockNumber: number) => void) => {
  const { provider } = useWeb3React()
  useEffect(() => {
    if (!provider) {
      return
    }
    const subscription = provider.on('block', callback)
    return () => {
      subscription.removeAllListeners()
    }
  })
}

// Parameters
const API_KEY = process.env.REACT_APP_LOCAL_API_KEY
const API_URL = process.env.REACT_APP_LOCAL_API_URL
const headers = {
  'x-api-key': API_KEY,
}

// UI
const Example = () => {
  const { account, isActive, provider } = useWeb3React()
  const [blockNumber, setBlockNumber] = useState<number>(0)
  const [connectionType, setConnectionType] = useState<ConnectionType | null>(null)
  const [orders, setOrders] = useState<any[]>([])

  const updateOrders = async () => {
    if (provider && provider.getSigner()) {
      const ordersResponse = await axios.get(`${API_URL}/orders`, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
        params: {
          desc: true,
          sortKey: 'createdAt',
          swapper: await provider.getSigner().getAddress(),
          limit: 2,
        },
      })
      setOrders(ordersResponse.data.orders)
    }
  }

  // Listen for new blocks and update the wallet
  // useOnBlockUpdated(async (blockNumber: number) => {
  //   setBlockNumber(blockNumber)
  //   updateOrders()
  // })

  const onPerformTestAction = async (
    tokenIn: string,
    tokenOut: string,
    amount: string,
    routingPreference: RoutingPreference
  ) => {
    if (!provider) {
      console.error('Error: No provider')
      return
    }

    const rpc = new JsonRpcProvider('')

    const fotContract = new Contract('0x19C97dc2a25845C7f9d1d519c8C2d4809c58b43f', FOT_ABI, rpc)

    const result = await fotContract.callStatic.validate(tokenIn, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 10_000)
    console.log(BigNumber.from(result[0]).toString())
  }

  const onPerformDemoAction = async (
    tokenIn: string,
    tokenOut: string,
    amount: string,
    routingPreference: RoutingPreference,
    chainId: number,
    orderType: string
  ) => {
    // const domain = {
    //   name: 'Permit2',
    //   chainId: 1,
    //   verifyingContract: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
    // }
    // const types = {
    //   PermitSingle: [
    //     {
    //       name: 'details',
    //       type: 'PermitDetails',
    //     },
    //     {
    //       name: 'spender',
    //       type: 'address',
    //     },
    //     {
    //       name: 'sigDeadline',
    //       type: 'uint256',
    //     },
    //   ],
    //   PermitDetails: [
    //     {
    //       name: 'token',
    //       type: 'address',
    //     },
    //     {
    //       name: 'amount',
    //       type: 'uint160',
    //     },
    //     {
    //       name: 'expiration',
    //       type: 'uint48',
    //     },
    //     {
    //       name: 'nonce',
    //       type: 'uint48',
    //     },
    //   ],
    // }
    // const values = {
    //   details: {
    //     token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    //     amount: '1461501637330902918203684832716283019655932542975',
    //     expiration: '1708706773',
    //     nonce: '2',
    //   },
    //   spender: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
    //   sigDeadline: '1706116573',
    // }

    // const sig =
    //   '0x13cbe83ae82589f4c1d677ec305e6939e06df803b6122b29248a0302e41c72be5dc7783a38ad11d0aff606f6d5b05b5ed4df190cb57fbbcbcf5ac973db2fd7711b'

    // const foo = verifyTypedData(domain, types, values, sig)

    // console.log('foo', foo)

    if (!provider) {
      console.error('Error: No provider')
      return
    }
    await switchNetwork(chainId, ConnectionType.INJECTED)
    console.log('Switched network')

    const signer = provider.getSigner()

    const quoteResponse = await axios.post(
      `${API_URL}/quote`,
      {
        type: orderType,
        tokenInChainId: chainId,
        tokenOutChainId: chainId,
        tokenIn,
        tokenOut,
        amount,
        swapper: await signer.getAddress(),
        routingPreference,
      },
      {
        headers,
      }
    )

    const approvalResponse = await axios.post(
      `${API_URL}/check_approval`,
      {
        walletAddress: await signer.getAddress(),
        amount: BigNumber.from(amount).mul(2).toString(),
        token: tokenIn,
        chainId,
        includeGasInfo: true,
      },
      {
        headers,
      }
    )

    if (approvalResponse.data.approval) {
      await signer.sendTransaction(approvalResponse.data.approval)
    }

    const { quote, permitData, routing } = quoteResponse.data

    signer._isSigner

    let signature
    if (permitData) {
      signature = await signer._signTypedData(permitData.domain, permitData.types, permitData.values)
    }

    let postOrderResponse
    if (routing === 'CLASSIC') {
      postOrderResponse = await axios.post(
        `${API_URL}/swap`,
        {
          signature,
          quote,
          permitData: permitData ?? undefined,
          includeGasInfo: true,
        },
        {
          headers,
        }
      )
      // const gasLimit = BigNumber.from(postOrderResponse.data.swap.gasLimit as string)
      //   .mul(3)
      //   .div(2)
      //   .toString()
      const estimatedGas = await signer.estimateGas({
        from: postOrderResponse.data.swap.from,
        to: postOrderResponse.data.swap.to,
        data: postOrderResponse.data.swap.data,
        value: BigNumber.from(postOrderResponse.data.swap.value).mul(1).toString(),
      })
      console.log('estimatedGas', estimatedGas.toString())
      console.log('gasLimit', postOrderResponse.data.swap.gasLimit)
      signer.sendTransaction({
        from: postOrderResponse.data.swap.from,
        to: postOrderResponse.data.swap.to,
        data: postOrderResponse.data.swap.data,
        value: BigNumber.from(postOrderResponse.data.swap.value).mul(1).toString(),
        // gasLimit: postOrderResponse.data.swap.gasLimit,
      })
    } else if (routing === 'DUTCH_LIMIT' || routing === 'DUTCH_V2') {
      postOrderResponse = await axios.post(
        `${API_URL}/order`,
        {
          signature,
          quote,
          routing,
        },
        {
          headers,
        }
      )
    }
  }

  const blastWETH = '0x4300000000000000000000000000000000000004'
  const blastUSDB = '0x4300000000000000000000000000000000000003'

  const arbUSDT = '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'
  const arbWeth = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'
  const arbUSDC = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'
  const arbUni = '0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0'
  const arbAxie = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'

  const bnbCoin = '0x0000000000000000000000000000000000000000'
  const bnbUSDT = '0x55d398326f99059fF775485246999027B3197955'

  const polygonUSDT = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'

  const mainnetUSDT = TOKENS[TOKEN_NAMES.USDT].address
  const mainnetUSDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
  const mainnetWeth = TOKENS[TOKEN_NAMES.WETH].address
  const mainnetBullet = '0x8ef32a03784c8Fd63bBf027251b9620865bD54B6'
  const mainnetBtc = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'

  const defaultNative = '0x0000000000000000000000000000000000000000'

  const [tokenIn, setTokenIn] = useState(arbWeth)
  const [tokenOut, setTokenOut] = useState(arbAxie)
  const [amount, setAmount] = useState('500000000')
  const [routingPreference, setRoutingPreference] = useState(RoutingPreference.CLASSIC)

  const exactIn = 'EXACT_INPUT'
  const exactOut = 'EXACT_OUTPUT'
  const [orderType, setOrderType] = useState(exactIn)

  const arb = 42161
  const op = 10
  const mainnet = 1
  const blast = 81457
  const [chainId, setChainId] = useState(arb)

  return (
    <div className="App">
      <ErrorBoundary FallbackComponent={FallbackComponent}>
        {INPUT_CHAIN_URL === '' && <h2 className="error">Please set your RPC URL in config.ts</h2>}
        <h3>{`Block Number: ${blockNumber + 1}`}</h3>
        <ConnectionOptions
          activeConnectionType={connectionType}
          isConnectionActive={isActive}
          onActivate={setConnectionType}
          onDeactivate={setConnectionType}
        />
        {/* <p>{`ChainId: ${chainId}`}</p> */}
        <p>{`Connected Account: ${account}`}</p>
        <form>
          <label>
            ChainId:
            <p />
            <input
              style={{ width: 400 }}
              type="text"
              value={chainId}
              onChange={(event) => setChainId(Number(event.target.value))}
            />
          </label>
          <p />
          <label>
            Token in:
            <p />
            <input
              style={{ width: 400 }}
              type="text"
              value={tokenIn}
              onChange={(event) => setTokenIn(event.target.value)}
            />
          </label>
          <p />
          <label>
            Token out:
            <p />
            <input
              style={{ width: 400 }}
              type="text"
              value={tokenOut}
              onChange={(event) => setTokenOut(event.target.value)}
            />
          </label>
          <p />
          {/* <button
            disabled={tokenIn === '0' || tokenOut === '0' || amount === '0'}
            onClick={() => {
              const temp = tokenIn
              setTokenIn(tokenOut)
              setTokenOut(temp)
            }}
          >
            Switch in to out
          </button> */}
          <p />
          <label>
            Amount:
            <p />
            <input
              style={{ width: 400 }}
              type="text"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </label>
          <p />
          <label>
            Routing Preference:
            <p />
            <input
              style={{ width: 400 }}
              type="text"
              value={routingPreference}
              onChange={(event) => setRoutingPreference(event.target.value as RoutingPreference)}
            />
          </label>
          <p />
          <label>
            Order Type:
            <p />
            <input
              style={{ width: 400 }}
              type="text"
              value={orderType}
              onChange={(event) => setOrderType(event.target.value as string)}
            />
          </label>
        </form>
        <div>
          <button
            disabled={tokenIn === '0' || tokenOut === '0' || amount === '0'}
            onClick={() => {
              onPerformDemoAction(tokenIn, tokenOut, amount, routingPreference, chainId, orderType)
            }}
          >
            Trade
          </button>
          <button onClick={updateOrders}>Fetch</button>
        </div>
        <p />
        {orders.map((order) => (
          <div key={order.orderId}>
            <p>{`Order created at: ${order.createdAt}`}</p>
          </div>
        ))}
      </ErrorBoundary>
    </div>
  )
}

// eslint-disable-next-line import/no-default-export
export default Example
