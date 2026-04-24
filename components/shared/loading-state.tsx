interface LoadingStateProps {
  label: string
}

export function LoadingState({ label }: LoadingStateProps) {
  return (
    <div className='bg-surface border border-border-default rounded-sm p-12 flex flex-col items-center justify-center gap-4'>
      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent' />
      <p className='font-mono text-label-mono-caps text-text-muted'>Carregando {label}...</p>
    </div>
  )
}
