import { useState } from 'react'
import { useContractRead } from 'wagmi'

import wagmigotchiABI from './wagmigotchi-abi.json'

export const ReadContract = () => {
  return (
    <div>
      <div>
        <GetAlive />
      </div>
      <div>
        <Love />
      </div>
    </div>
  )
}

const GetAlive = () => {
  const { data, isRefetching, isSuccess, refetch } = useContractRead(
    {
      addressOrName: '0xecb504d39723b0be0e3a9aa33d646642d1051ee1',
      contractInterface: wagmigotchiABI,
    },
    'getAlive',
  )

  return (
    <div>
      Is wagmigotchi alive?: {isSuccess && <span>{data ? 'yes' : 'no'}</span>}
      <button
        disabled={isRefetching}
        onClick={() => refetch()}
        style={{ marginLeft: 4 }}
      >
        {isRefetching ? 'loading...' : 'refetch'}
      </button>
    </div>
  )
}

const Love = () => {
  const { data, isFetching, isRefetching, isSuccess, read } = useContractRead(
    {
      addressOrName: '0xecb504d39723b0be0e3a9aa33d646642d1051ee1',
      contractInterface: wagmigotchiABI,
    },
    'love',
    { enabled: false },
  )

  const [address, setAddress] = useState<string>('')

  return (
    <div>
      Get wagmigotchi love:
      <input
        onChange={(e) => setAddress(e.target.value)}
        placeholder="wallet address"
        style={{ marginLeft: 4 }}
        value={address}
      />
      <button onClick={() => read({ args: [address] })}>
        {isFetching
          ? isRefetching
            ? 'refetching...'
            : 'fetching...'
          : 'fetch'}
      </button>
      {isSuccess && <div>{data.toString()}</div>}
    </div>
  )
}
