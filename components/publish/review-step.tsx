"use client";

import { BnDisclaimerCallout } from "@/components/publish/bn-disclaimer-callout";
import { Checkbox } from "@/components/ui/checkbox";
import { formatAgeRating } from "@/lib/constants/scripts";
import type { AudioEntry } from "@/lib/hooks/use-audio-entries";
import type { PublishFormValues } from "@/lib/validators/publish";
import { FileIcon, Info, Music, Tag } from "lucide-react";
import Image from "next/image";

interface ReviewStepProps {
  values: PublishFormValues;
  pdfFile: File | null;
  audioEntries: AudioEntry[];
  coverPreviewUrl?: string | null;
  termsAccepted: boolean;
  onTermsAcceptedChange: (accepted: boolean) => void;
}

export function ReviewStep({
  values,
  pdfFile,
  audioEntries,
  coverPreviewUrl,
  termsAccepted,
  onTermsAcceptedChange,
}: ReviewStepProps) {
  const readyAudios = audioEntries.filter((entry) => entry.file || entry.storagePath);
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-elevated border border-border-subtle rounded-sm p-6 flex flex-col gap-8">
        {/* Info Summary */}
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-sm bg-brand-accent/10 flex items-center justify-center text-brand-accent shrink-0">
            <Info size={20} />
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-xs font-mono text-text-muted uppercase tracking-wider">
              Informações
            </span>
            <h3 className="text-heading-3 text-text-primary truncate">
              {values.title || "Sem título"}
            </h3>
            {values.logline && (
              <p className="text-body-small text-text-secondary line-clamp-2">
                {values.logline}
              </p>
            )}
          </div>
          {coverPreviewUrl ? (
            <div className="w-16 aspect-[2/3] rounded-sm overflow-hidden shrink-0 relative">
              <Image
                src={coverPreviewUrl}
                alt="Capa"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : null}
        </div>

        {/* Files Summary */}
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-sm bg-brand-accent/10 flex items-center justify-center text-brand-accent shrink-0">
            <FileIcon size={20} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-mono text-text-muted uppercase tracking-wider">
              Arquivos
            </span>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-body-small text-text-secondary">
                <span className="font-medium text-text-primary">PDF:</span>
                <span>
                  {pdfFile?.name ||
                    values.pdfStoragePath?.split("/").pop() ||
                    "Não selecionado"}
                </span>
              </div>
              {readyAudios.length > 0 && (
                <div className="flex items-start gap-2 text-body-small text-text-secondary">
                  <Music size={14} className="text-brand-accent mt-0.5" />
                  <span className="font-medium text-text-primary">
                    Áudios ({readyAudios.length}):
                  </span>
                  <span>
                    {readyAudios.map((entry) => entry.title).join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Categories Summary */}
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-sm bg-brand-accent/10 flex items-center justify-center text-brand-accent shrink-0">
            <Tag size={20} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-mono text-text-muted uppercase tracking-wider">
              Categorias
            </span>
            <div className="flex gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-body-small">
                <span className="text-text-muted">Gênero:</span>
                <span className="text-text-primary font-medium">
                  {values.genre || "Não definido"}
                </span>
              </div>
              {values.subgenres.length > 0 && (
                <div className="flex items-center gap-1.5 text-body-small">
                  <span className="text-text-muted">Subgêneros:</span>
                  <span className="text-text-primary font-medium">
                    {values.subgenres.join(", ")}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-body-small">
                <span className="text-text-muted">Classificação:</span>
                <span className="text-text-primary font-medium">
                  {values.ageRating
                    ? formatAgeRating(values.ageRating)
                    : "Não definido"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-brand-accent/5 border border-brand-accent/20 rounded-sm flex gap-3 items-start">
        <Info size={18} className="text-brand-accent shrink-0 mt-0.5" />
        <p className="text-xs text-brand-accent/80 leading-relaxed">
          Ao publicar, seu roteiro ficará disponível para todos os usuários da
          plataforma. Você poderá editá-lo ou removê-lo a qualquer momento
          através do seu painel.
        </p>
      </div>

      <BnDisclaimerCallout />

      {/* Terms acceptance — required to publish the content publicly */}
      <div className="flex items-start gap-3 p-4 bg-elevated border border-border-subtle rounded-sm">
        <Checkbox
          id="terms-accept"
          checked={termsAccepted}
          onCheckedChange={(checked) => onTermsAcceptedChange(checked === true)}
          className="mt-0.5"
        />
        <label
          htmlFor="terms-accept"
          className="text-body-small text-text-secondary leading-relaxed cursor-pointer"
        >
          Li e concordo com a{" "}
          <a
            href="/legal/publicacao-e-confidencialidade"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-brand-accent underline underline-offset-2 hover:text-brand-accent/80"
          >
            Política de Publicação, Propriedade Intelectual e Confidencialidade
          </a>{" "}
          e autorizo a disponibilização pública deste conteúdo na plataforma.
        </label>
      </div>
    </div>
  );
}
