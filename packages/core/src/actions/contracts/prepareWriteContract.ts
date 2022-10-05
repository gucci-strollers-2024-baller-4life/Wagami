import { Abi, Address } from 'abitype'
import { CallOverrides, PopulatedTransaction } from 'ethers/lib/ethers'

import {
  ConnectorNotFoundError,
  ContractMethodDoesNotExistError,
} from '../../errors'
import { Signer } from '../../types'
import { DefaultOptions, GetConfig, Options } from '../../types/contracts'
import {
  assertActiveChain,
  minimizeContractInterface,
  normalizeFunctionName,
} from '../../utils'
import { fetchSigner } from '../accounts'
import { getContract } from './getContract'

export type PrepareWriteContractConfig<
  TAbi = Abi,
  TFunctionName = string,
  TSigner extends Signer = Signer,
  TOptions extends Options = DefaultOptions,
> = GetConfig<
  {
    abi: TAbi
    functionName: TFunctionName
    /** Chain id to use for provider */
    chainId?: number
    /** Call overrides */
    overrides?: CallOverrides
    /** Custom signer */
    signer?: TSigner | null
  },
  'nonpayable' | 'payable',
  TOptions
>

export type PrepareWriteContractResult = {
  abi: Abi | readonly unknown[]
  address: string
  chainId?: number
  functionName: string
  mode: 'prepared'
  request: PopulatedTransaction & {
    to: Address
    gasLimit: NonNullable<PopulatedTransaction['gasLimit']>
  }
}

/**
 * @description Prepares the parameters required for a contract write transaction.
 *
 * Returns config to be passed through to `writeContract`.
 *
 * @example
 * import { prepareWriteContract, writeContract } from '@wagmi/core'
 *
 * const config = await prepareWriteContract({
 *  address: '0x...',
 *  abi: wagmiAbi,
 *  functionName: 'mint',
 * })
 * const result = await writeContract(config)
 */
export async function prepareWriteContract<
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
  TSigner extends Signer = Signer,
>({
  abi,
  address,
  args,
  chainId,
  functionName,
  overrides,
  signer: signer_,
}: PrepareWriteContractConfig<
  TAbi,
  TFunctionName,
  TSigner
>): Promise<PrepareWriteContractResult> {
  const signer = signer_ ?? (await fetchSigner({ chainId }))
  if (!signer) throw new ConnectorNotFoundError()
  if (chainId) assertActiveChain({ chainId })

  const contract = getContract({ address, abi, signerOrProvider: signer })
  const normalizedFunctionName = normalizeFunctionName({
    contract,
    functionName,
    args,
  })
  const populateTransactionFn =
    contract.populateTransaction[normalizedFunctionName]
  if (!populateTransactionFn)
    throw new ContractMethodDoesNotExistError({
      address,
      functionName: normalizedFunctionName,
    })

  const params = [...(args ?? []), ...(overrides ? [overrides] : [])]
  const unsignedTransaction = (await populateTransactionFn(
    ...params,
  )) as PopulatedTransaction & {
    to: Address
  }
  const gasLimit =
    unsignedTransaction.gasLimit ||
    (await signer.estimateGas(unsignedTransaction))

  const minimizedAbi = minimizeContractInterface({
    abi,
    functionName,
  })

  return {
    abi: minimizedAbi,
    address,
    chainId,
    functionName,
    mode: 'prepared',
    request: {
      ...unsignedTransaction,
      gasLimit,
    },
  }
}
