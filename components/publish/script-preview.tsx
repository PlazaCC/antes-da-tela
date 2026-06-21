"use client";

import { Tag } from "@/components/tag/tag";
import { PdfFullscreenDialog } from "@/components/pdf-viewer/pdf-fullscreen-dialog";
import { RadioBox } from "@/components/radio-box/radio-box";
import { cn } from "@/lib/utils";
import { formatAgeRating, type AudioCategory } from "@/lib/constants/scripts";
import type { AudioEntry } from "@/lib/hooks/use-audio-entries";
import { getAssetUrl } from "@/lib/storage/url";
import type { PublishFormValues } from "@/lib/validators/publish";
import { AlertCircle, FileText, ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export type ScriptVisibility = "public" | "private" | "draft";

interface ScriptPreviewProps {
  title: string;
  genre: PublishFormValues["genre"];
  subgenres: PublishFormValues["subgenres"];
  ageRating: PublishFormValues["ageRating"];
  coverPreviewUrl: string | null;
  audioEntries: AudioEntry[];
  pitchDeckFile: File | null;
  pitchDeckStoragePath: string;
  visibility: ScriptVisibility;
  onVisibilityChange: (visibility: ScriptVisibility) => void;
  /** Reasons publishing is currently blocked (CPF / BN registration missing). */
  publishBlockers?: string[];
  className?: string;
}

export function ScriptPreview({
  title,
  genre,
  subgenres,
  ageRating,
  coverPreviewUrl,
  audioEntries,
  pitchDeckFile,
  pitchDeckStoragePath,
  visibility,
  onVisibilityChange,
  publishBlockers = [],
  className,
}: ScriptPreviewProps) {
  const [pitchOpen, setPitchOpen] = useState(false);

  // Resolve playable audio URLs (object URL for local files, CDN for uploaded).
  const audioTracks = useMemo(
    () =>
      audioEntries
        .map((entry) => {
          if (entry.file) return { id: entry.id, title: entry.title, url: URL.createObjectURL(entry.file), isBlob: true };
          const url = getAssetUrl(entry.storagePath, "audio");
          return url ? { id: entry.id, title: entry.title, url, isBlob: false } : null;
        })
        .filter((t): t is { id: string; title: AudioCategory; url: string; isBlob: boolean } => t !== null),
    [audioEntries],
  );

  useEffect(() => {
    return () => {
      audioTracks.forEach((t) => t.isBlob && URL.revokeObjectURL(t.url));
    };
  }, [audioTracks]);

  const pitchDeckObjectUrl = useMemo(
    () => (pitchDeckFile ? URL.createObjectURL(pitchDeckFile) : null),
    [pitchDeckFile],
  );
  useEffect(() => {
    return () => {
      if (pitchDeckObjectUrl) URL.revokeObjectURL(pitchDeckObjectUrl);
    };
  }, [pitchDeckObjectUrl]);

  const pitchDeckUrl =
    pitchDeckObjectUrl ?? getAssetUrl(pitchDeckStoragePath, "scripts");
  return (
    <div
      className={cn(
        "bg-surface border border-border-default rounded-sm p-6 flex flex-col gap-6 justify-between",
        className,
      )}
    >
      <h3 className="font-semibold text-[15px] text-text-primary">
        Prévia do roteiro
      </h3>

      <div className="flex gap-5">
        <div className="w-[108px] shrink-0 aspect-[2/3] rounded-sm bg-elevated border border-border-subtle overflow-hidden relative flex flex-col items-center justify-center gap-1">
          {coverPreviewUrl ? (
            <Image
              src={coverPreviewUrl}
              alt="Capa"
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <>
              <ImageIcon className="w-6 h-6 text-text-muted" />
              <span className="font-mono text-[10px] text-text-muted text-center">
                Prévia da capa
              </span>
            </>
          )}
        </div>

        <div className="flex flex-col gap-3 min-w-0">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider">
              CATEGORIZAÇÃO
            </span>
            <div className="flex gap-1.5 flex-wrap mt-1">
              {genre ? <Tag variant="default">{genre}</Tag> : null}
              {subgenres.map((sub) => (
                <Tag key={sub} variant="default">
                  {sub}
                </Tag>
              ))}
              {ageRating ? (
                <Tag variant="default">{formatAgeRating(ageRating)}</Tag>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <p className="font-display text-[18px] text-text-primary leading-snug line-clamp-2">
          {title ? (
            <span>{title}</span>
          ) : (
            <span className="text-text-muted italic">Título do roteiro</span>
          )}
        </p>
      </div>

      {(audioTracks.length > 0 || pitchDeckUrl) && (
        <>
          <div className="border-t border-border-subtle" />
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider">
              MÍDIA
            </span>

            {audioTracks.map((track) => (
              <div key={track.id} className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-text-secondary">
                  {track.title}
                </span>
                <audio controls preload="metadata" src={track.url} className="w-full h-9" />
              </div>
            ))}

            {pitchDeckUrl ? (
              <button
                type="button"
                onClick={() => setPitchOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-sm border border-border-subtle bg-elevated hover:bg-surface-hover transition-colors text-[13px] text-text-secondary hover:text-text-primary self-start">
                <FileText size={15} className="text-brand-accent" />
                Ver Pitch Deck
              </button>
            ) : null}
          </div>
        </>
      )}

      {pitchDeckUrl ? (
        <PdfFullscreenDialog
          open={pitchOpen}
          onOpenChange={setPitchOpen}
          url={pitchDeckUrl}
          title="Pitch Deck — prévia"
        />
      ) : null}

      <div className="border-t border-border-subtle" />

      <div className="flex flex-col gap-3">
        <span className="font-semibold text-[15px] text-text-primary">
          Visibilidade
        </span>
        <div className="grid gap-3">
          <RadioBox
            name="script-visibility"
            label="Público"
            description="Visível para todos os usuários."
            checked={visibility === "public"}
            onChange={() => onVisibilityChange("public")}
            className="rounded-sm border-border-subtle bg-elevated hover:border-border-default hover:bg-elevated"
          />
          <RadioBox
            name="script-visibility"
            label="Privado"
            description="Apenas você pode visualizar."
            checked={visibility === "private"}
            onChange={() => onVisibilityChange("private")}
            className="rounded-sm border-border-subtle bg-elevated hover:border-border-default hover:bg-elevated"
          />
          <RadioBox
            name="script-visibility"
            label="Rascunho"
            description="Salve para revisar antes de publicar."
            checked={visibility === "draft"}
            onChange={() => onVisibilityChange("draft")}
            className="rounded-sm border-border-subtle bg-elevated hover:border-border-default hover:bg-elevated"
          />
        </div>

        {publishBlockers.length > 0 ? (
          <div className="flex flex-col gap-2 rounded-sm border border-state-error/30 bg-state-error/5 p-3">
            <div className="flex items-center gap-1.5 text-state-error">
              <AlertCircle className="size-4 shrink-0" />
              <span className="text-[13px] font-medium">
                Pendências para publicar
              </span>
            </div>
            <ul className="flex flex-col gap-1 pl-5 list-disc text-[12px] text-text-secondary">
              {publishBlockers.map((blocker) => (
                <li key={blocker}>{blocker}</li>
              ))}
            </ul>
            <Link
              href="/profile/edit"
              className="text-[12px] font-medium text-brand-accent hover:underline">
              Completar perfil →
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
