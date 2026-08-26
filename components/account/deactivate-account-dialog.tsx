'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useTRPC } from '@/trpc/client'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function DeactivateAccountDialog() {
  const trpc = useTRPC()
  const router = useRouter()

  const { mutate, isPending } = useMutation(
    trpc.users.deactivateAccount.mutationOptions({
      onSuccess: async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.replace('/')
      },
      onError: (err) => toast.error(err.message),
    }),
  )

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant='outline' size='sm' className='border-yellow-600/50 text-yellow-600 hover:bg-yellow-600/5 hover:text-yellow-600'>
          Desativar conta
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Desativar conta?</AlertDialogTitle>
          <AlertDialogDescription>
            Seu perfil e roteiros ficarão ocultos para outros usuários. Seus dados não serão excluídos —
            você pode reativar a conta fazendo login novamente a qualquer momento.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={() => mutate()}
            className='bg-yellow-600 hover:bg-yellow-700 text-white'>
            {isPending ? 'Desativando…' : 'Desativar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
