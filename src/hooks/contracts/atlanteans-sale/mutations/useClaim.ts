import { useMutation } from '@tanstack/react-query'
import { useToast, useLogger, useNetwork, useFetchSignature } from '@/hooks'
import { AtlanteansSaleUtil } from '@/contracts'
import { useSigner } from 'wagmi'
import { SalePhase } from '@/constants'

/**
 * * Phase 4: free claim for Founding Atlanteans (who are allowed via merkle tree)
 */
export const useClaim = () => {
  const log = useLogger(useClaim.name)
  const toast = useToast()

  const { isActiveChainSupported } = useNetwork()
  const { data: signer } = useSigner()
  const { mutateAsync: fetchSignature } = useFetchSignature()

  const mutation = useMutation({
    mutationFn: async (quantity: number) => {
      if (!isActiveChainSupported || !signer) {
        // TODO: toast error
        return
      }

      const signature = await fetchSignature({ salePhase: SalePhase.WL })
      if (!signature) {
        // TODO: toast error
        return
      }

      const { tx, error } = await AtlanteansSaleUtil.claim({ signer, signature, quantity })
      // TODO: toast error
      return tx
    },
    onError: (error: any, variables, context) => {
      log.error({ error, variables, context })
      toast({
        id: useClaim.name,
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
      toast({
        id: useClaim.name,
        status: 'success',
        title: 'Success',
        description: data?.hash,
      })
    },
  })

  return mutation
}
