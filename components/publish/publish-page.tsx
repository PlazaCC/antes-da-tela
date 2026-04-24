'use client'

import { Progress } from '@/components/progress'
import { FileStep } from '@/components/publish/file-step'
import { GenreStep } from '@/components/publish/genre-step'
import { InfoStep } from '@/components/publish/info-step'
import { ReviewStep } from '@/components/publish/review-step'
import { LoadingState } from '@/components/shared/loading-state'
import { PageShell } from '@/components/shared/page-shell'
import { SectionCard } from '@/components/shared/section-card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { usePublishForm } from '@/lib/hooks/use-publish-form'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const STEP_LABELS = ['Informações', 'Arquivos', 'Categorias', 'Revisão'] as const

interface PublishPageProps {
  scriptId?: string
}

export function PublishPage({ scriptId }: PublishPageProps) {
  const router = useRouter()
  const {
    step,
    nextStep,
    prevStep,
    register,
    setValue,
    formState,
    values: formValues,
    pdfFile,
    audioFile,
    coverFile,
    bannerFile,
    pdfProgress,
    audioProgress,
    coverProgress,
    bannerProgress,
    pdfError,
    audioError,
    coverError,
    bannerError,
    setPdfFile,
    setAudioFile,
    setCoverFile,
    setBannerFile,
    setPdfError,
    setAudioError,
    setCoverError,
    setBannerError,
    isEditing,
    isLoadingScript,
    uploading,
    uploadError,
    isPending,
    handlePublish,
    canProceed,
    validatePDF,
    validateAudio,
    validateImage,
    hasUnsavedChanges,
  } = usePublishForm(scriptId)

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)

  return (
    <PageShell
      title={isEditing ? 'Editar Roteiro' : 'Publicar Roteiro'}
      description='Complete as etapas abaixo para disponibilizar sua obra.'
      headerActions={
        <Button
          variant='secondary'
          onClick={() => {
            if (hasUnsavedChanges) {
              setIsCancelDialogOpen(true)
              return
            }
            router.back()
          }}
          disabled={uploading || isPending}>
          Cancelar
        </Button>
      }
      className='max-w-3xl px-4 md:px-6 pb-24 md:pb-12'>
      <div className='flex flex-col gap-6 md:gap-8'>
        <Progress current={step} steps={[...STEP_LABELS]} />

        {isEditing && isLoadingScript ? (
          <LoadingState label='roteiro' />
        ) : (
          <SectionCard className='p-5 md:p-8 flex flex-col gap-6 md:gap-8'>
            {step === 1 && <InfoStep register={register} errors={formState.errors} />}
            {step === 2 && (
              <FileStep
                pdfFile={pdfFile}
                audioFile={audioFile}
                coverFile={coverFile}
                bannerFile={bannerFile}
                pdfStoragePath={formValues.pdfStoragePath ?? ''}
                audioStoragePath={formValues.audioStoragePath ?? ''}
                coverStoragePath={formValues.coverStoragePath ?? ''}
                bannerStoragePath={formValues.bannerStoragePath ?? ''}
                setValue={setValue}
                setPdfFile={setPdfFile}
                setAudioFile={setAudioFile}
                setCoverFile={setCoverFile}
                setBannerFile={setBannerFile}
                pdfProgress={pdfProgress}
                audioProgress={audioProgress}
                coverProgress={coverProgress}
                bannerProgress={bannerProgress}
                pdfError={pdfError}
                audioError={audioError}
                coverError={coverError}
                bannerError={bannerError}
                onSetPdfError={setPdfError}
                onSetAudioError={setAudioError}
                onSetCoverError={setCoverError}
                onSetBannerError={setBannerError}
                validatePDF={validatePDF}
                validateAudio={validateAudio}
                validateImage={validateImage}
              />
            )}
            {step === 3 && <GenreStep genre={formValues.genre} ageRating={formValues.ageRating} setValue={setValue} />}
            {step === 4 && <ReviewStep values={formValues} pdfFile={pdfFile} audioFile={audioFile} />}

            {uploadError ? (
              <p className='text-state-error text-xs font-mono'>{uploadError}</p>
            ) : uploading ? (
              <p className='text-text-secondary text-sm'>Preparando o envio...</p>
            ) : null}

            <div className='flex items-center justify-between pt-4 border-t border-border-subtle'>
              <Button
                variant='ghost'
                onClick={prevStep}
                disabled={step === 1 || uploading}
                className='text-text-muted hover:text-text-primary'>
                Voltar
              </Button>

              {step < 4 ? (
                <Button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className='bg-brand-accent text-text-primary hover:bg-brand-accent/90'>
                  Continuar
                </Button>
              ) : (
                <Button
                  onClick={handlePublish}
                  disabled={uploading || isPending}
                  className='bg-brand-accent text-text-primary hover:bg-brand-accent/90 px-8'>
                  {uploading || isPending
                    ? isEditing
                      ? 'Salvando...'
                      : 'Publicando...'
                    : isEditing
                      ? 'Salvar Alterações'
                      : 'Publicar Roteiro'}
                </Button>
              )}
            </div>
          </SectionCard>
        )}
      </div>

      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tem certeza que deseja sair?</DialogTitle>
            <DialogDescription>
              As alterações da publicação serão perdidas se você sair agora. Se você estiver editando um roteiro
              existente, as modificações não salvas também serão descartadas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setIsCancelDialogOpen(false)}>
              Continuar editando
            </Button>
            <Button
              onClick={() => {
                setIsCancelDialogOpen(false)
                router.back()
              }}
              className='bg-state-error text-white hover:bg-state-error/90'>
              Sair sem salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
