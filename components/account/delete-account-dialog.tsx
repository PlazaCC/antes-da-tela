'use client'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTRPC } from '@/trpc/client'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface DeleteAccountDialogProps {
  email: string
}

export function DeleteAccountDialog({ email }: DeleteAccountDialogProps) {
  const trpc = useTRPC()
  const router = useRouter()
  const [confirmation, setConfirmation] = useState('')

  const { mutate, isPending } = useMutation(
    trpc.users.deleteAccount.mutationOptions({
      onSuccess: () => router.replace('/'),
      onError: (err) => toast.error(err.message),
    }),
  )

  const isConfirmed = email.length > 0 && confirmation === email

  return (
    <AlertDialog onOpenChange={() => setConfirmation('')}>
      <AlertDialogTrigger asChild>
        <Button variant='destructive' size='sm'>
          Excluir conta permanentemente
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir conta permanentemente?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação é <strong>irreversível</strong>. Todos os seus roteiros, comentários, avaliações e
            dados de perfil serão excluídos para sempre.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className='flex flex-col gap-1.5 py-1'>
          <label className='text-xs text-muted-foreground'>
            Para confirmar, digite seu e-mail: <span className='font-mono text-foreground'>{email}</span>
          </label>
          <Input
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder={email}
            autoComplete='off'
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <Button
            variant='destructive'
            disabled={!isConfirmed || isPending}
            onClick={() => mutate()}>
            {isPending ? 'Excluindo…' : 'Excluir minha conta'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
