import { notifyError } from "@/lib/feedback";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { usePublishFiles } from "@/lib/hooks/use-publish-files";
import { usePublishUpload } from "@/lib/hooks/use-publish-upload";
import { usePublishUploadProgress } from "@/lib/hooks/use-publish-upload-progress";
import {
  publishFormSchema,
  type PublishFormValues,
} from "@/lib/validators/publish";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm, type UseFormSetValue } from "react-hook-form";
import { toast } from "sonner";

const INITIAL_PUBLISH_FORM_VALUES: PublishFormValues = {
  title: "",
  logline: "",
  synopsis: "",
  genre: "",
  ageRating: "",
  pdfStoragePath: "",
  audioStoragePath: "",
  coverStoragePath: "",
  bannerStoragePath: "",
  pitchDeckStoragePath: "",
};

export interface UsePublishFormResult {
  step: number;
  nextStep: () => void;
  prevStep: () => void;
  register: ReturnType<typeof useForm<PublishFormValues>>["register"];
  watch: ReturnType<typeof useForm<PublishFormValues>>["watch"];
  reset: ReturnType<typeof useForm<PublishFormValues>>["reset"];
  setValue: UseFormSetValue<PublishFormValues>;
  formState: ReturnType<typeof useForm<PublishFormValues>>["formState"];
  values: PublishFormValues;
  status?: "draft" | "published";
  coverUrl: string | null;
  pdfFile: File | null;
  audioFile: File | null;
  coverFile: File | null;
  bannerFile: File | null;
  pitchDeckFile: File | null;
  pdfError: string;
  audioError: string;
  coverError: string;
  bannerError: string;
  pitchDeckError: string;
  setPdfFile: (file: File | null) => void;
  setAudioFile: (file: File | null) => void;
  setCoverFile: (file: File | null) => void;
  setBannerFile: (file: File | null) => void;
  setPitchDeckFile: (file: File | null) => void;
  setPdfError: (value: string) => void;
  setAudioError: (value: string) => void;
  setCoverError: (value: string) => void;
  setBannerError: (value: string) => void;
  setPitchDeckError: (value: string) => void;
  isEditing: boolean;
  isLoadingScript: boolean;
  pdfProgress: number;
  audioProgress: number;
  coverProgress: number;
  bannerProgress: number;
  pitchDeckProgress: number;
  uploading: boolean;
  uploadError: string;
  isPending: boolean;
  handlePublish: (options?: {
    status?: "draft" | "published";
  }) => Promise<void>;
  canProceed: () => boolean;
  validatePDF: (file: File) => string | null;
  validateAudio: (file: File) => string | null;
  validateImage: (file: File) => string | null;
  hasUnsavedChanges: boolean;
}

export function usePublishForm(scriptId?: string): UsePublishFormResult {
  const router = useRouter();
  const trpc = useTRPC();
  const { userId } = useCurrentUser();
  const { uploadFile } = usePublishUpload();
  const isEditing = Boolean(scriptId);

  const files = usePublishFiles();
  const progress = usePublishUploadProgress();

  const [baselineValues, setBaselineValues] = useState<PublishFormValues>(
    INITIAL_PUBLISH_FORM_VALUES,
  );
  const [step, setStep] = useState(1);

  const form = useForm<PublishFormValues>({
    resolver: zodResolver(publishFormSchema),
    defaultValues: baselineValues,
    mode: "onTouched",
  });

  const { register, watch, reset, setValue, formState } = form;
  const values = watch();

  const { data: existingScript, isLoading: isLoadingScript } = useQuery(
    trpc.scripts.getById.queryOptions(
      { id: scriptId ?? "" },
      { enabled: isEditing },
    ),
  );

  const coverUrl = existingScript?.cover_url ?? null;
  const status =
    existingScript?.status === "archived" ? undefined : existingScript?.status;

  useEffect(() => {
    const defaults = INITIAL_PUBLISH_FORM_VALUES;
    reset(defaults);
    setBaselineValues(defaults);
    setStep(1);
    files.resetFiles();
    progress.resetProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset, scriptId]);

  useEffect(() => {
    if (!isEditing || !existingScript || userId !== existingScript.author?.id)
      return;

    const loadedValues: PublishFormValues = {
      title: existingScript.title,
      logline: existingScript.logline || "",
      synopsis: existingScript.synopsis || "",
      genre: (existingScript.genre as PublishFormValues["genre"]) || "",
      ageRating:
        (existingScript.age_rating as PublishFormValues["ageRating"]) || "",
      pdfStoragePath: existingScript.script_files[0]?.storage_path || "",
      audioStoragePath: existingScript.audio_files[0]?.storage_path || "",
      coverStoragePath: (existingScript.cover_path as string) || "",
      bannerStoragePath: (existingScript.banner_path as string) || "",
      pitchDeckStoragePath: (existingScript.pitch_deck_path as string) || "",
    };

    reset(loadedValues);
    setBaselineValues(loadedValues);
    files.resetFiles();
  }, [existingScript, isEditing, reset, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasFormChanges = useMemo(
    () =>
      values.title.trim() !== baselineValues.title.trim() ||
      values.logline.trim() !== baselineValues.logline.trim() ||
      values.synopsis.trim() !== baselineValues.synopsis.trim() ||
      values.genre !== baselineValues.genre ||
      values.ageRating !== baselineValues.ageRating ||
      values.pdfStoragePath !== baselineValues.pdfStoragePath ||
      values.audioStoragePath !== baselineValues.audioStoragePath ||
      values.coverStoragePath !== baselineValues.coverStoragePath ||
      values.bannerStoragePath !== baselineValues.bannerStoragePath,
    [baselineValues, values],
  );

  const hasFileChanges = useMemo(
    () =>
      Boolean(files.pdfFile) ||
      Boolean(files.audioFile) ||
      Boolean(files.coverFile) ||
      Boolean(files.bannerFile) ||
      Boolean(files.pitchDeckFile),
    [files.pdfFile, files.audioFile, files.coverFile, files.bannerFile, files.pitchDeckFile],
  );

  const hasUnsavedChanges = useMemo(
    () => step !== 1 || hasFormChanges || hasFileChanges || formState.isDirty,
    [formState.isDirty, hasFileChanges, hasFormChanges, step],
  );

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const createMutation = useMutation(
    trpc.scripts.create.mutationOptions({
      onSuccess: (script) => {
        toast.success("Roteiro publicado com sucesso!");
        router.push(`/scripts/${script.id}`);
      },
    }),
  );

  const updateMutation = useMutation(
    trpc.scripts.update.mutationOptions({
      onSuccess: (script) => {
        toast.success("Roteiro atualizado com sucesso!");
        router.push(`/scripts/${script.id}`);
      },
    }),
  );

  const handlePublish = async (options?: {
    status?: "draft" | "published";
  }) => {
    if (!userId) return;
    progress.setUploadError("");

    const desiredStatus = options?.status;

    let pdfPath = values.pdfStoragePath;
    let audioPath = values.audioStoragePath;
    let coverPath = values.coverStoragePath;
    let bannerPath = values.bannerStoragePath;
    let pitchDeckPath = values.pitchDeckStoragePath;

    try {
      if (!userId) throw new Error("Usuário não autenticado.");
      progress.setUploading(true);

      const S3_FOLDER_MAP = {
        scripts: "scripts",
        audio: "audio",
        covers: "covers",
        banners: "banners",
        "pitch-decks": "pitch-decks",
      } as const;

      const uploadAsset = async (
        file: File | null,
        currentPath: string,
        folder: keyof typeof S3_FOLDER_MAP,
        onProgress: (pct: number) => void,
        fieldName: keyof PublishFormValues,
      ) => {
        if (!file) return currentPath;

        const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const key = `${folder}/${userId}/${Date.now()}_${sanitized}`;

        await uploadFile(key, file, onProgress);
        setValue(fieldName, key);
        return key;
      };

      pdfPath = await uploadAsset(
        files.pdfFile,
        pdfPath,
        "scripts",
        progress.setPdfProgress,
        "pdfStoragePath",
      );
      audioPath = await uploadAsset(
        files.audioFile,
        audioPath,
        "audio",
        progress.setAudioProgress,
        "audioStoragePath",
      );
      coverPath = await uploadAsset(
        files.coverFile,
        coverPath,
        "covers",
        progress.setCoverProgress,
        "coverStoragePath",
      );
      bannerPath = await uploadAsset(
        files.bannerFile,
        bannerPath,
        "banners",
        progress.setBannerProgress,
        "bannerStoragePath",
      );
      pitchDeckPath = await uploadAsset(
        files.pitchDeckFile,
        pitchDeckPath,
        "pitch-decks",
        progress.setPitchDeckProgress,
        "pitchDeckStoragePath",
      );

      progress.setUploading(false);

      if (isEditing) {
        updateMutation.mutate({
          id: scriptId as string,
          title: values.title,
          logline: values.logline || undefined,
          synopsis: values.synopsis || undefined,
          genre: values.genre || undefined,
          ageRating: values.ageRating || undefined,
          status: desiredStatus,
          storagePath: pdfPath || undefined,
          fileSize: files.pdfFile?.size,
          coverPath: coverPath === "" ? null : coverPath,
          bannerPath: bannerPath === "" ? null : bannerPath,
          pitchDeckPath: pitchDeckPath === "" ? null : pitchDeckPath,
          audioStoragePath: audioPath || undefined,
        });
      } else {
        createMutation.mutate({
          title: values.title,
          logline: values.logline || undefined,
          synopsis: values.synopsis || undefined,
          genre: values.genre || undefined,
          ageRating: values.ageRating || undefined,
          status: desiredStatus,
          storagePath: pdfPath!,
          fileSize: files.pdfFile?.size,
          audioStoragePath: audioPath || undefined,
          coverPath: coverPath || undefined,
          bannerPath: bannerPath || undefined,
          pitchDeckPath: pitchDeckPath || undefined,
        });
      }
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : "Falha no envio. Tente novamente.";
      progress.setUploading(false);
      progress.setUploadError(msg);
      notifyError(msg);
    }
  };

  const canProceed = () => {
    if (step === 1) return values.title.trim().length > 0;
    if (step === 2)
      return (
        (isEditing ||
          files.pdfFile !== null ||
          values.pdfStoragePath.length > 0) &&
        !files.pdfError
      );
    return true;
  };

  const nextStep = () => setStep((value) => Math.min(value + 1, 4));
  const prevStep = () => setStep((value) => Math.max(value - 1, 1));

  return {
    step,
    nextStep,
    prevStep,
    register,
    watch,
    reset,
    setValue,
    formState,
    values,
    status,
    coverUrl,
    pdfFile: files.pdfFile,
    audioFile: files.audioFile,
    coverFile: files.coverFile,
    bannerFile: files.bannerFile,
    pitchDeckFile: files.pitchDeckFile,
    pdfError: files.pdfError,
    audioError: files.audioError,
    coverError: files.coverError,
    bannerError: files.bannerError,
    pitchDeckError: files.pitchDeckError,
    setPdfFile: files.setPdfFile,
    setAudioFile: files.setAudioFile,
    setCoverFile: files.setCoverFile,
    setBannerFile: files.setBannerFile,
    setPitchDeckFile: files.setPitchDeckFile,
    setPdfError: files.setPdfError,
    setAudioError: files.setAudioError,
    setCoverError: files.setCoverError,
    setBannerError: files.setBannerError,
    setPitchDeckError: files.setPitchDeckError,
    isEditing,
    isLoadingScript,
    pdfProgress: progress.pdfProgress,
    audioProgress: progress.audioProgress,
    coverProgress: progress.coverProgress,
    bannerProgress: progress.bannerProgress,
    pitchDeckProgress: progress.pitchDeckProgress,
    uploading: progress.uploading,
    uploadError: progress.uploadError,
    isPending: createMutation.isPending || updateMutation.isPending,
    handlePublish,
    canProceed,
    validatePDF: files.validatePDF,
    validateAudio: files.validateAudio,
    validateImage: files.validateImage,
    hasUnsavedChanges,
  };
}
