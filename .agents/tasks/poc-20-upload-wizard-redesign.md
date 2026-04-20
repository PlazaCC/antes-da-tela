---
title: "Redesenhar fluxo de upload como wizard multi-step com Progress"
type: frontend
priority: P1
branch: fix/upload-wizard-redesign
clickup: https://app.clickup.com/t/86agytwhw
figmaNodeIds:
  Step1: "115:1008"
  Step2: "115:1075"
  Step3: "125:1430"
  Step4: "128:1691"
figmaSection: "Fluxo de cadastro de roteiro (186:1350)"
---

## Objetivo
Refatorar a página de publicação de roteiro (`/publish` ou `/publicar`) para implementar o wizard multi-step de 4 etapas do Figma, incluindo o componente `Progress` (115:1296) como indicador de etapas e os formulários corretos de cada step.

## Contexto
- Figma: seção `Fluxo de cadastro de roteiro` nodeId `186:1350`
  - Step 1: `Fluxo upload / Informações Básicas` → nodeId `115:1008`
  - Step 2: `Fluxo upload / Arquivos` → nodeId `115:1075`
  - Step 3: `Fluxo upload / Categorização` → nodeId `125:1430`
  - Step 4: `Fluxo upload / Revisar` → nodeId `128:1691`
- Buscar specs: `mcp__Framelink_Figma_MCP__get_figma_data(fileKey="iUb8odefGSZiHz4KjuzX1M", nodeId="186:1350")`
- Implementação atual: formulário único básico em `app/(authenticated)/publish/page.tsx`
- Componente `Progress` (115:1296) completamente ausente — precisa ser criado
- Componente `Input (form)` (100:622) com variantes específicas para o upload flow
- `Drag` (100:1303): já existe `DragZone` mas precisa das variantes `file` e `audio`

## Componentes a criar/atualizar

### Progress (115:1296) — NOVO
```
Indicador de step wizard horizontal
Props: current (1-4), steps: string[] (nomes das etapas)
Visual: círculos numerados + linhas conectoras
  - Concluído: círculo preenchido brand/accent + check icon
  - Ativo: círculo preenchido brand/accent + número
  - Pendente: círculo outline border/subtle + número text/muted
```

### Input (form) (100:622) — variantes específicas
```
Variantes confirmadas no Figma:
  - input-profile: campo de nome/username
  - input-tagline: campo de logline (1 linha curta)
  - input-description: textarea de sinopse (multiline)
  - input-base: campo padrão simples
```

## Steps

### Step 1 — Informações Básicas (115:1008)
- Campos: Título, Logline (tagline input), Sinopse (textarea), Classificação Etária
- Validação Zod: título obrigatório, logline max 120 chars, sinopse opcional
- Botão "Próximo" avança para step 2

### Step 2 — Arquivos (115:1075)  
- DragZone variant `file` para PDF (bucket `scripts`, 50MB max, `application/pdf`)
- DragZone variant `audio` para áudio opcional (bucket `audio`, 100MB max, `audio/*`)
- Upload direto client-side via `supabase.storage.from()` com progresso percentual
- Botão "Próximo" só habilitado após PDF uploaded

### Step 3 — Categorização (125:1430)
- Campo de Gênero: Checkbox multi-select com lista de gêneros (usar constante `GENRES`)
- Radio box para classificação etária (se não coletado no step 1)
- Botão "Próximo" exige pelo menos 1 gênero selecionado

### Step 4 — Revisar (128:1691)
- Preview somente-leitura de todos os dados coletados
- Exibir: título, logline, sinopse, gênero(s), PDF filename, áudio (se houver)
- Botão "Publicar" chama `trpc.scripts.create()` e redireciona para `/scripts/[id]`
- Botão "Voltar" volta para o step anterior

### Wizard state management
- Usar Zustand store local ou `useState` com array de valores por step
- Manter dados preenchidos ao navegar entre steps
- URL pode usar `?step=1` para deep-link / refresh safety

## Implementation Plan

1. Criar `components/progress/progress.tsx`:
   - Props: `current: number`, `total: number`, `labels?: string[]`
   - Buscar spec via Framelink: `nodeId="115:1296"`

2. Criar `components/upload-wizard/upload-wizard.tsx`:
   - Orquestra os 4 steps com `Progress` no topo
   - Cada step é um sub-componente: `StepInfo`, `StepFiles`, `StepCategorizacao`, `StepRevisar`

3. Criar variantes de `Input (form)` em `components/upload-wizard/`:
   - Wrappers finos sobre shadcn `Input` e `Textarea` com estilos do Figma

4. Atualizar `DragZone` para suportar variant `audio` (`accept="audio/*"`)

5. Refatorar `app/(authenticated)/publish/page.tsx` para usar `UploadWizard`

6. Verificar se `scripts.create()` aceita todos os campos novos (gênero como array, classificação etária, audio_path)

## Acceptance Criteria
- [x] Progress indicator visível no topo com 4 steps, estado ativo/concluído visualmente distinto
- [x] Step 1 coleta título, logline, sinopse com validação Zod
- [x] Step 2 faz upload de PDF com barra de progresso percentual; áudio é opcional
- [x] Step 3 permite selecionar gênero(s) via Checkbox
- [x] Step 4 exibe preview e o botão "Publicar" chama tRPC e redireciona
- [x] Dados não se perdem ao navegar entre steps
- [x] `yarn build` e `yarn lint` passam

## Artifacts
- `components/progress/progress.tsx` + `index.ts` (novo)
- `components/upload-wizard/upload-wizard.tsx` + sub-components (novo)
- `app/(authenticated)/publish/page.tsx` (refatorado)
- `components/drag-zone/drag-zone.tsx` (variant audio adicionado)
