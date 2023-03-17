import { useLogger } from '@/hooks'
import { useQuery } from 'wagmi'
import { useSigner } from 'wagmi'

export const useNonce = () => {
  const log = useLogger(useNonce.name)
  const { data: signer } = useSigner()

  const query = useQuery(['get-nonce'], {
    queryFn: async () => {
      const nonce = await signer?.getTransactionCount()
      return nonce
    },
    cacheTime: 0,
    onSuccess: (data) => {
      log.success({ data })
    },
    onError: (error) => {
      log.error({ error })
    },
  })

  return query
}
