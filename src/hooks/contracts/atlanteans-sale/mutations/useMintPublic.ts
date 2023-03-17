import { AtlanteansSaleUtil } from '@/contracts'
import { useLogger, useNetwork, useToast } from '@/hooks'
import { useMutation } from 'wagmi'
import { useSigner } from 'wagmi'

/**
 * * Phase 3: Public (paid)
 */
export const useMintPublic = () => {
  const log = useLogger(useMintPublic.name)
  const toast = useToast()

  const { isActiveChainSupported } = useNetwork()
  const { data: signer } = useSigner()

  const mutation = useMutation({
    mutationFn: async (quantity: number) => {
      if (!isActiveChainSupported || !signer) {
        // TODO: toast error
        return
      }

      const { tx, error } = await AtlanteansSaleUtil.mintPublic({ signer, quantity })
      // TODO: toast error
      return tx
    },
    onError: (error: any, variables, context) => {
      log.error({ error, variables, context })
      toast({
        id: useMintPublic.name,
        status: 'error',
        title: error?.message ?? 'Error',
        description: error?.data?.message || 'unexpected error occurred',
      })
    },
    onMutate: (variables) => {
      log.verbose('ON_MUTATE', { variables })
    },
    onSettled: (data, error, variables, context) => {
      log.verbose('ON_SETTLED', { data, error, variables, context })
    },
    onSuccess: (data, variables, context) => {
      log.success({ data, variables, context })
      toast.close(useMintPublic.name)
      toast({
        id: useMintPublic.name,
        status: 'success',
        title: 'Success',
        description: data?.hash,
      })
    },
  })

  return mutation
}
