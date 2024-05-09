import {
  type Config,
  type GetBlockNumberErrorType,
  type ResolvedRegister,
} from '@wagmi/core'
import { type Evaluate } from '@wagmi/core/internal'
import {
  type GetBlockNumberData,
  type GetBlockNumberOptions,
  type GetBlockNumberQueryFnData,
  type GetBlockNumberQueryKey,
  getBlockNumberQueryOptions,
} from '@wagmi/core/query'

import type { ConfigParameter, QueryParameter } from '../types/properties.js'
import { type UseQueryReturnType, useQuery } from '../utils/query.js'
import { useChainId } from './useChainId.js'
import { useConfig } from './useConfig.js'

export type UseBlockNumberParameters<
  config extends Config = Config,
  chainId extends config['chains'][number]['id'] = config['chains'][number]['id'],
  selectData = GetBlockNumberData,
> = Evaluate<
  GetBlockNumberOptions<config, chainId> &
    ConfigParameter<config> &
    QueryParameter<
      GetBlockNumberQueryFnData,
      GetBlockNumberErrorType,
      selectData,
      GetBlockNumberQueryKey<config, chainId>
    > /*& {
      watch?:
        | boolean
        | UnionEvaluate<
            UnionOmit<
              UseWatchBlockNumberParameters<config, chainId>,
              'chainId' | 'config' | 'onBlockNumber' | 'onError'
            >
          >
        | undefined
    }*/
>

export type UseBlockNumberReturnType<selectData = GetBlockNumberData> =
  UseQueryReturnType<selectData, GetBlockNumberErrorType>

/** https://wagmi.sh/vue/api/composables/useBlockNumber */
export function useBlockNumber<
  config extends Config = ResolvedRegister['config'],
  chainId extends config['chains'][number]['id'] = config['chains'][number]['id'],
  selectData = GetBlockNumberData,
>(
  parameters: UseBlockNumberParameters<config, chainId, selectData> = {},
): UseBlockNumberReturnType<selectData> {
  const { query = {} /*watch*/ } = parameters

  const config = useConfig(parameters)
  // const queryClient = useQueryClient()
  const configChainId = useChainId({ config })
  const chainId = parameters.chainId ?? configChainId.value

  const options = getBlockNumberQueryOptions(config, {
    ...parameters,
    chainId,
  })

  // TODO: implement
  // useWatchBlockNumber({
  //   ...({
  //     config: parameters.config,
  //     chainId: parameters.chainId,
  //     ...(typeof watch === 'object' ? watch : {}),
  //   } as UseWatchBlockNumberParameters),
  //   enabled: Boolean(
  //     (query.enabled ?? true) &&
  //       (typeof watch === 'object' ? watch.enabled : watch),
  //   ),
  //   onBlockNumber(blockNumber) {
  //     queryClient.setQueryData(options.queryKey, blockNumber)
  //   },
  // })

  return useQuery({
    ...query,
    ...options,
  } as any) as UseBlockNumberReturnType<selectData>
}