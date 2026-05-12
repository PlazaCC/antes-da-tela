"use client";

import { Tag } from "@/components/tag/tag";
import { RadioBox } from "@/components/radio-box/radio-box";
import { cn } from "@/lib/utils";
import { formatAgeRating } from "@/lib/constants/scripts";
import type { PublishFormValues } from "@/lib/validators/publish";
import { ImageIcon } from "lucide-react";
import Image from "next/image";

export type ScriptVisibility = "public" | "private" | "draft";

interface ScriptPreviewProps {
  title: string;
  genre: PublishFormValues["genre"];
  ageRating: PublishFormValues["ageRating"];
  coverPreviewUrl: string | null;
  visibility: ScriptVisibility;
  onVisibilityChange: (visibility: ScriptVisibility) => void;
  className?: string;
}

export function ScriptPreview({
  title,
  genre,
  ageRating,
  coverPreviewUrl,
  visibility,
  onVisibilityChange,
  className,
}: ScriptPreviewProps) {
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
      </div>
    </div>
  );
}
