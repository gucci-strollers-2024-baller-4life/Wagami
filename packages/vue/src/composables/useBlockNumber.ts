import { useQueryClient } from '@tanstack/vue-query'
import {
  type Config,
  type GetBlockNumberErrorType,
  type ResolvedRegister,
} from '@wagmi/core'
import {
  type Evaluate,
  type UnionEvaluate,
  type UnionOmit,
} from '@wagmi/core/internal'
import {
  type GetBlockNumberData,
  type GetBlockNumberOptions,
  type GetBlockNumberQueryFnData,
  type GetBlockNumberQueryKey,
  getBlockNumberQueryOptions,
} from '@wagmi/core/query'
import { computed } from 'vue'

import type { ConfigParameter, QueryParameter } from '../types/properties.js'
import type { DeepMaybeRef, DeepUnwrapRef } from '../types/ref.js'
import { cloneDeepUnref } from '../utils/cloneDeep.js'
import { type UseQueryReturnType, useQuery } from '../utils/query.js'
import { useChainId } from './useChainId.js'
import { useConfig } from './useConfig.js'
import {
  type UseWatchBlockNumberParameters,
  useWatchBlockNumber,
} from './useWatchBlockNumber.js'

export type UseBlockNumberParameters<
  config extends Config = Config,
  chainId extends config['chains'][number]['id'] = config['chains'][number]['id'],
  selectData = GetBlockNumberData,
> = Evaluate<
  DeepMaybeRef<
    GetBlockNumberOptions<config, chainId> &
      ConfigParameter<config> &
      QueryParameter<
        GetBlockNumberQueryFnData,
        GetBlockNumberErrorType,
        selectData,
        GetBlockNumberQueryKey<config, chainId>
      > & {
        watch?:
          | boolean
          | UnionEvaluate<
              UnionOmit<
                DeepUnwrapRef<UseWatchBlockNumberParameters<config, chainId>>,
                'chainId' | 'config' | 'onBlockNumber' | 'onError'
              >
            >
          | undefined
      }
  >
>

export type UseBlockNumberReturnType<selectData = GetBlockNumberData> =
  UseQueryReturnType<selectData, GetBlockNumberErrorType>

/** https://wagmi.sh/vue/api/composables/useBlockNumber */
export function useBlockNumber<
  config extends Config = ResolvedRegister['config'],
  chainId extends config['chains'][number]['id'] = config['chains'][number]['id'],
  selectData = GetBlockNumberData,
>(
  parameters_: UseBlockNumberParameters<config, chainId, selectData> = {},
): UseBlockNumberReturnType<selectData> {
  const parameters = computed(() => cloneDeepUnref(parameters_))

  const config = useConfig(parameters)
  const queryClient = useQueryClient()
  const configChainId = useChainId({ config })

  const queryOptions = computed(() => {
    const {
      chainId = configChainId.value,
      query = {},
      watch: _,
      ...rest
    } = parameters.value
    const options = getBlockNumberQueryOptions(config, {
      ...rest,
      chainId,
    })
    return {
      ...query,
      ...options,
    }
  })

  const watchBlockNumberArgs = computed(() => {
    const {
      config,
      chainId = configChainId.value,
      query,
      watch,
    } = parameters.value
    return {
      ...({
        config,
        chainId,
        ...(typeof watch === 'object' ? watch : {}),
      } as UseWatchBlockNumberParameters),
      enabled:
        (query?.enabled ?? true) &&
        (typeof watch === 'object' ? watch.enabled : watch),
      onBlockNumber(blockNumber) {
        queryClient.setQueryData(queryOptions.value.queryKey, blockNumber)
      },
    } satisfies UseWatchBlockNumberParameters
  })

  useWatchBlockNumber(watchBlockNumberArgs)

  return useQuery(
    queryOptions.value as any,
  ) as UseBlockNumberReturnType<selectData>
}
