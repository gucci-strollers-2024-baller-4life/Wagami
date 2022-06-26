import * as React from 'react'
import { ConnectArgs, ConnectResult, connect } from '@wagmi/core'
import { useMutation } from 'react-query'

import { useClient } from '../../context'
import { MutationConfig } from '../../types'
import { useForceUpdate } from '../utils'

export type UseConnectArgs = Partial<ConnectArgs>

export type UseConnectConfig = MutationConfig<ConnectResult, Error, ConnectArgs>

export const mutationKey = (args: UseConnectArgs) =>
  [{ entity: 'connect', ...args }] as const

const mutationFn = (args: UseConnectArgs) => {
  const { connector, chainId } = args
  if (!connector) throw new Error('connector is required')
  return connect({ connector, chainId })
}

export function useConnect({
  chainId,
  connector,
  onError,
  onMutate,
  onSettled,
  onSuccess,
}: UseConnectArgs & UseConnectConfig = {}) {
  const client = useClient()
  const forceUpdate = useForceUpdate()

  React.useEffect(() => {
    // Trigger update when connectors change
    const unsubscribe = client.subscribe(
      (state) => state.connectors,
      forceUpdate,
    )
    return unsubscribe
  }, [client, forceUpdate])

  const {
    data,
    error,
    isError,
    isIdle,
    isLoading,
    isSuccess,
    mutate,
    mutateAsync,
    reset,
    status,
    variables,
  } = useMutation(mutationKey({ connector, chainId }), mutationFn, {
    onError,
    onMutate,
    onSettled,
    onSuccess,
  })

  const connect = React.useCallback(
    (args?: Partial<ConnectArgs>) => {
      return mutate(<ConnectArgs>{
        chainId: args?.chainId ?? chainId,
        connector: args?.connector ?? connector,
      })
    },
    [chainId, connector, mutate],
  )

  const connectAsync = React.useCallback(
    (args?: Partial<ConnectArgs>) => {
      return mutateAsync(<ConnectArgs>{
        chainId: args?.chainId ?? chainId,
        connector: args?.connector ?? connector,
      })
    },
    [chainId, connector, mutateAsync],
  )

  return {
    connect,
    connectAsync,
    connectors: client.connectors,
    data,
    error,
    isError,
    isIdle,
    isLoading,
    isSuccess,
    pendingConnector: variables?.connector,
    reset,
    status,
    variables,
  } as const
}
