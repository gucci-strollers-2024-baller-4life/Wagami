import { createMutation } from '@tanstack/solid-query'
import { For, Show } from 'solid-js'
import { type Config, createAccount, createAccountEffect, createChainId, createConfig, createConnect, createConnections, createConnectorClient, createDisconnect, createSwitchAccount } from 'solid-wagmi'
import { type SwitchChainParameters, switchChain } from 'solid-wagmi/actions'

function App() {
  createAccountEffect(()=>({
    onConnect(data) {
      console.log('onConnect', data)
    },
    onDisconnect() {
      console.log('onDisconnect')
    },
  }))

  return (
    <>
      <Account />
      <Connect />
      <SwitchAccount />
      <Connections />
      <SwitchChain />
      {/* <ConnectorClient /> */}
    </>
  )
}

function Account() {
  const { account } = createAccount()
  const { disconnect } = createDisconnect()

  return (
    <div>
      <h2>Account</h2>

      <div>
        account: {account.address}
        <br />
        chainId: {account.chainId}
        <br />
        status: {account.status}
      </div>

      <Show when={account.status !== 'disconnected'} >
        <button type="button" onClick={() => disconnect()}>
          Disconnect
        </button>
      </Show>
    </div>
  )
}

function Connect() {
  const { chain } = createChainId()
  const { connectors, connect, mutation } = createConnect()

  return (
    <div>
      <h2>Connect</h2>
      <For each={connectors} >
        {(connector)=>(
          <button
            onClick={() => connect({ connector, chainId: chain.id })}
            type="button"
          >
            {connector.name}
          </button>
        )}
      </For>
      
      <div>{mutation.status}</div>
      <div>{mutation.error?.message}</div>
    </div>
  )
}

function SwitchAccount() {
  const { account } = createAccount()
  const { connectors, switchAccount } = createSwitchAccount()

  return (
    <div>
      <h2>Switch Account</h2>

      <For each={connectors} >
        {(connector)=>(
          <button
          disabled={account.connector?.uid === connector.uid}
          onClick={() => switchAccount({ connector })}
          type="button"
        >
          {connector.name}
        </button>
        )}
      </For>
    </div>
  )
}

type MutationVariables<T extends Config> = SwitchChainParameters<T, T['chains'][number]['id']>
function SwitchChain() {
  const config = createConfig()
  const { chain: _chain } = createChainId()

  const mutation = createMutation(()=>({
    mutationFn: function(variables: MutationVariables<typeof config>) {
      return switchChain(config, variables)
    },
    mutationKey: ['switchChain'],
  }))
  
  return (
    <div>
      <h2>Switch Chain</h2>

      <For each={config.chains} >
        {(chain)=>(
          <button
            disabled={_chain.id === chain.id}
            onClick={()=>mutation.mutate({ chainId: chain.id })}
            type="button"
          >
            {chain.name}
          </button>
        )}
      </For>

      {mutation.error?.message}
    </div>
  )
}

function SignMessage() {
//TODO
return null
}

function Connections() {
  const { connections } = createConnections()

  return (
    <div>
      <h2>Connections</h2>

      <For each={connections} >
        {(connection)=>(
          <div>
            <div>connector {connection.connector.name}</div>
            <div>accounts: {JSON.stringify(connection.accounts)}</div>
            <div>chainId: {connection.chainId}</div>
          </div>
        )}
      </For>
    </div>
  )
}

function Balance() {
// TODO
return null
}

function BlockNumber() {
// TODO
return null
}

function ConnectorClient() {
  const query = createConnectorClient()
  return (
    <div>
      <h2>Connector Client</h2>
      client {query.data?.account?.address} {query.data?.chain?.id}
      {query.error?.message}
    </div>
  )
}

function SendTransaction() {
// TODO
return null
}

function ReadContract() {
// TODO
return null
}

function ReadContracts() {
// TODO
return null
}

function WriteContract() {
// TODO
return null
}

export default App