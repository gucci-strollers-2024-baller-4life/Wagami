import { type QueryOptions } from '@tanstack/query-core'

import {
  type VerifyMessageErrorType,
  type VerifyMessageParameters,
  type VerifyMessageReturnType,
  verifyMessage,
} from '../actions/verifyMessage.js'
import { type Config } from '../createConfig.js'
import type { ScopeKeyParameter } from '../types/properties.js'
import type { Evaluate, ExactPartial } from '../types/utils.js'
import { filterQueryOptions } from './utils.js'

export type VerifyMessageOptions<
  config extends Config,
  chainId extends config['chains'][number]['id'],
> = Evaluate<
  ExactPartial<VerifyMessageParameters<config, chainId>> & ScopeKeyParameter
>

export function verifyMessageQueryOptions<
  config extends Config,
  chainId extends config['chains'][number]['id'],
>(config: Config, options: VerifyMessageOptions<Config, chainId>) {
  return {
    async queryFn({ queryKey }) {
      const { address, message, signature } = queryKey[1]
      if (!address || !message || !signature)
        throw new Error('address, message, and signature are required')

      const { scopeKey: _, ...parameters } = queryKey[1]

      const verified = await verifyMessage(
        config,
        parameters as VerifyMessageParameters,
      )
      return verified ?? null
    },
    queryKey: verifyMessageQueryKey(options),
  } as const satisfies QueryOptions<
    VerifyMessageQueryFnData,
    VerifyMessageErrorType,
    VerifyMessageData,
    VerifyMessageQueryKey
  >
}
export type VerifyMessageQueryFnData = VerifyMessageReturnType

export type VerifyMessageData = VerifyMessageQueryFnData

export function verifyMessageQueryKey<
  config extends Config,
  chainId extends config['chains'][number]['id'],
>(options: VerifyMessageOptions<config, chainId>) {
  return ['verifyMessage', filterQueryOptions(options)] as const
}

export type VerifyMessageQueryKey = ReturnType<typeof verifyMessageQueryKey>
