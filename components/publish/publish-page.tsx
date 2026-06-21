"use client";

import { Progress } from "@/components/progress";
import { FileStep } from "@/components/publish/file-step";
import { GenreStep } from "@/components/publish/genre-step";
import { InfoStep } from "@/components/publish/info-step";
import { ReviewStep } from "@/components/publish/review-step";
import {
  ScriptPreview,
  type ScriptVisibility,
} from "@/components/publish/script-preview";
import { LoadingState } from "@/components/shared/loading-state";
import { PageShell } from "@/components/shared/page-shell";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePublishForm } from "@/lib/hooks/use-publish-form";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const STEP_LABELS = [
  "Informações",
  "Arquivos",
  "Categorias",
  "Revisão",
] as const;

const STEP_META = [
  {
    title: "Informações básicas do roteiro",
    subtitle: "Etapa 1 de 4 — Preencha os dados principais do seu projeto",
  },
  {
    title: "Arquivos do projeto",
    subtitle: "Etapa 2 de 4 — Faça o upload do PDF e arquivos opcionais",
  },
  {
    title: "Categorização",
    subtitle: "Etapa 3 de 4 — Defina o gênero e classificação do roteiro",
  },
  {
    title: "Revisão e publicação",
    subtitle: "Etapa 4 de 4 — Revise os dados antes de publicar",
  },
] as const;

interface PublishPageProps {
  scriptId?: string;
}

export function PublishPage({ scriptId }: PublishPageProps) {
  const router = useRouter();
  const {
    step,
    nextStep,
    prevStep,
    register,
    setValue,
    formState,
    values: formValues,
    coverUrl,
    status,
    pdfFile,
    coverFile,
    bannerFile,
    pitchDeckFile,
    pdfProgress,
    coverProgress,
    bannerProgress,
    pitchDeckProgress,
    pdfError,
    coverError,
    bannerError,
    pitchDeckError,
    setPdfFile,
    setCoverFile,
    setBannerFile,
    setPitchDeckFile,
    setPdfError,
    setCoverError,
    setBannerError,
    setPitchDeckError,
    audioEntries,
    addAudioEntry,
    removeAudioEntry,
    updateAudioEntry,
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
  } = usePublishForm(scriptId);

  const trpc = useTRPC();
  const { userId } = useCurrentUser();
  const { data: profile } = useQuery({
    ...trpc.users.getProfile.queryOptions({ id: userId ?? "" }),
    enabled: !!userId,
  });

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [visibility, setVisibility] = useState<ScriptVisibility>("public");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Publishing requires the author's CPF and the work's BN registration.
  const publishBlockers = useMemo(() => {
    const blockers: string[] = [];
    if (!profile?.cpf) blockers.push("Preencha o CPF no seu perfil");
    if (!(formValues.bnRegistration ?? "").trim())
      blockers.push("Informe o registro na Biblioteca Nacional");
    return blockers;
  }, [profile?.cpf, formValues.bnRegistration]);

  const publishBlocked = visibility === "public" && publishBlockers.length > 0;
  // Public content additionally requires accepting the platform's policies.
  const termsBlocked = visibility === "public" && !termsAccepted;

  useEffect(() => {
    if (!status) return;
    setVisibility(status === "draft" ? "draft" : "public");
  }, [status]);

  const [coverObjectUrl, setCoverObjectUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!coverFile) {
      setCoverObjectUrl(null);
      return;
    }

    const url = URL.createObjectURL(coverFile);
    setCoverObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [coverFile]);

  const coverPreviewUrl = useMemo(() => {
    if (coverObjectUrl) return coverObjectUrl;
    if (coverUrl) return coverUrl;
    return null;
  }, [coverObjectUrl, coverUrl]);

  const selectedStepMeta =
    STEP_META[Math.max(0, Math.min(step - 1, STEP_META.length - 1))];
  const loglineValue = formValues.logline ?? "";

  return (
    <PageShell
      title={isEditing ? "Editar Roteiro" : "Publicar Roteiro"}
      description="Complete as etapas abaixo para disponibilizar sua obra."
      headerActions={
        <Button
          variant="secondary"
          onClick={() => {
            if (hasUnsavedChanges) {
              setIsCancelDialogOpen(true);
              return;
            }
            router.back();
          }}
          disabled={uploading || isPending}
        >
          Cancelar
        </Button>
      }
      className="max-w-3xl lg:max-w-6xl px-4 md:px-6 pb-24 md:pb-12"
    >
      <div className="flex flex-col gap-6 md:gap-8">
        <div className="flex md:hidden justify-between items-center">
          <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider">
            Etapa {step} de 4
          </span>
          <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider truncate max-w-[60%]">
            {selectedStepMeta.title}
          </span>
        </div>

        <Progress current={step} steps={[...STEP_LABELS]} />

        <div className="flex flex-col gap-1.5">
          <h2 className="font-display text-[24px] text-text-primary">
            {selectedStepMeta.title}
          </h2>
          <p className="text-[13px] text-text-muted">
            {selectedStepMeta.subtitle}
          </p>
        </div>

        {isEditing && isLoadingScript ? (
          <LoadingState label="roteiro" />
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <SectionCard className="flex-1 min-w-0 p-5 md:p-8 flex flex-col gap-6 md:gap-8 w-full">
              {step === 1 && (
                <InfoStep
                  register={register}
                  errors={formState.errors}
                  loglineValue={loglineValue}
                />
              )}
              {step === 2 && (
                <FileStep
                  pdfFile={pdfFile}
                  coverFile={coverFile}
                  bannerFile={bannerFile}
                  pitchDeckFile={pitchDeckFile}
                  pdfStoragePath={formValues.pdfStoragePath ?? ""}
                  coverStoragePath={formValues.coverStoragePath ?? ""}
                  bannerStoragePath={formValues.bannerStoragePath ?? ""}
                  pitchDeckStoragePath={formValues.pitchDeckStoragePath ?? ""}
                  setValue={setValue}
                  setPdfFile={setPdfFile}
                  setCoverFile={setCoverFile}
                  setBannerFile={setBannerFile}
                  setPitchDeckFile={setPitchDeckFile}
                  pdfProgress={pdfProgress}
                  coverProgress={coverProgress}
                  bannerProgress={bannerProgress}
                  pitchDeckProgress={pitchDeckProgress}
                  pdfError={pdfError}
                  coverError={coverError}
                  bannerError={bannerError}
                  pitchDeckError={pitchDeckError}
                  onSetPdfError={setPdfError}
                  onSetCoverError={setCoverError}
                  onSetBannerError={setBannerError}
                  onSetPitchDeckError={setPitchDeckError}
                  audioEntries={audioEntries}
                  addAudioEntry={addAudioEntry}
                  removeAudioEntry={removeAudioEntry}
                  updateAudioEntry={updateAudioEntry}
                  validatePDF={validatePDF}
                  validateAudio={validateAudio}
                  validateImage={validateImage}
                />
              )}
              {step === 3 && (
                <GenreStep
                  genre={formValues.genre}
                  subgenres={formValues.subgenres ?? []}
                  ageRating={formValues.ageRating}
                  setValue={setValue}
                />
              )}
              {step === 4 && (
                <ReviewStep
                  values={formValues}
                  pdfFile={pdfFile}
                  audioEntries={audioEntries}
                  coverPreviewUrl={coverPreviewUrl}
                  termsAccepted={termsAccepted}
                  onTermsAcceptedChange={setTermsAccepted}
                />
              )}

              {uploadError ? (
                <p className="flex items-center gap-1.5 text-state-error text-sm">
                  <AlertCircle className="size-4 shrink-0" />
                  {uploadError}
                </p>
              ) : uploading ? (
                <p className="text-text-secondary text-sm">
                  Preparando o envio...
                </p>
              ) : null}

              <div className="hidden md:flex items-center justify-between pt-4 border-t border-border-subtle">
                <Button
                  variant="ghost"
                  onClick={prevStep}
                  disabled={step === 1 || uploading}
                  className="text-text-muted hover:text-text-primary"
                >
                  Voltar
                </Button>

                {step < 4 ? (
                  <Button
                    onClick={nextStep}
                    disabled={!canProceed()}
                    className="bg-brand-accent text-text-primary hover:bg-brand-accent/90"
                  >
                    Continuar
                  </Button>
                ) : (
                  <Button
                    onClick={() =>
                      handlePublish({
                        status: visibility === "public" ? "published" : "draft",
                      })
                    }
                    disabled={
                      uploading || isPending || publishBlocked || termsBlocked
                    }
                    className="bg-brand-accent text-text-primary hover:bg-brand-accent/90 px-8"
                  >
                    {uploading || isPending
                      ? isEditing
                        ? "Salvando..."
                        : "Publicando..."
                      : isEditing
                        ? "Salvar Alterações"
                        : "Publicar Roteiro"}
                  </Button>
                )}
              </div>

              <div className="lg:hidden h-[80px]" />
            </SectionCard>

            <aside className="hidden lg:flex flex-col w-[452px] shrink-0 sticky top-24">
              <ScriptPreview
                title={formValues.title ?? ""}
                genre={formValues.genre ?? ""}
                subgenres={formValues.subgenres ?? []}
                ageRating={formValues.ageRating ?? ""}
                coverPreviewUrl={coverPreviewUrl}
                audioEntries={audioEntries}
                pitchDeckFile={pitchDeckFile}
                pitchDeckStoragePath={formValues.pitchDeckStoragePath ?? ""}
                visibility={visibility}
                onVisibilityChange={setVisibility}
                publishBlockers={
                  visibility === "public" ? publishBlockers : []
                }
              />
            </aside>
          </div>
        )}
      </div>

      <div className="md:hidden fixed bottom-16 left-0 right-0 z-30 bg-bg-base border-t border-border-subtle px-5 py-4 flex gap-3 pb-[calc(16px+env(safe-area-inset-bottom))]">
        {step > 1 ? (
          <Button
            variant="outline"
            className="flex-1"
            onClick={prevStep}
            disabled={uploading}
          >
            Voltar
          </Button>
        ) : null}
        {step < 4 ? (
          <Button
            className="flex-1"
            onClick={nextStep}
            disabled={!canProceed()}
          >
            Continuar
          </Button>
        ) : (
          <Button
            className="flex-1"
            onClick={() =>
              handlePublish({
                status: visibility === "public" ? "published" : "draft",
              })
            }
            disabled={
              uploading || isPending || publishBlocked || termsBlocked
            }
          >
            {uploading || isPending
              ? isEditing
                ? "Salvando..."
                : "Publicando..."
              : step === 4
                ? "Publicar"
                : "Continuar"}
          </Button>
        )}
      </div>

      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tem certeza que deseja sair?</DialogTitle>
            <DialogDescription>
              As alterações da publicação serão perdidas se você sair agora. Se
              você estiver editando um roteiro existente, as modificações não
              salvas também serão descartadas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCancelDialogOpen(false)}
            >
              Continuar editando
            </Button>
            <Button
              onClick={() => {
                setIsCancelDialogOpen(false);
                router.back();
              }}
              className="bg-state-error text-white hover:bg-state-error/90"
            >
              Sair sem salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
