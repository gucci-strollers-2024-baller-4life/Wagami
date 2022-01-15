import { providers } from 'ethers'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from 'remix'
import type { MetaFunction } from 'remix'

// Imports
import { Connector, Provider, chain, defaultChains } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'

export function loader() {
  require('dotenv').config()
  return {
    alchemy: process.env.REMIX_ALCHEMY_ID as string,
    etherscan: process.env.REMIX_ETHERSCAN_API_KEY as string,
    infuraId: process.env.REMIX_INFURA_ID as string,
  }
}

export const meta: MetaFunction = () => {
  return { title: 'wagmi' }
}

export default function App() {
  // Get environment variables
  const { alchemy, etherscan, infuraId } = useLoaderData()

  // Pick chains
  const chains = defaultChains
  const defaultChain = chain.mainnet

  // Set up connectors
  const connectors = () => {
    return [new InjectedConnector({ chains })]
  }

  // Set up providers
  type ProviderConfig = { chainId?: number; connector?: Connector }
  const isChainSupported = (chainId?: number) =>
    chains.some((x) => x.id === chainId)

  const provider = ({ chainId }: ProviderConfig) =>
    providers.getDefaultProvider(
      isChainSupported(chainId) ? chainId : defaultChain.id,
      {
        alchemy,
        etherscan,
        infuraId,
      },
    )
  const webSocketProvider = ({ chainId }: ProviderConfig) =>
    isChainSupported(chainId)
      ? new providers.InfuraWebSocketProvider(chainId, infuraId)
      : undefined

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Provider
          autoConnect
          connectors={connectors}
          provider={provider}
          webSocketProvider={webSocketProvider}
        >
          <Outlet />
        </Provider>
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === 'development' && <LiveReload />}
      </body>
    </html>
  )
}
