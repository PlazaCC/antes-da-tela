---
name: refactor-plan
description: >-
  Plano executável para refatorações arquiteturais: modularização, remoção de
  duplicação e priorização por ganho de redução de código e consistência.
user-invocable: true
---

# Refactor Plan — Plano de Refatoração Arquitetural (Claude)

Resumo e objetivo

- Gera um processo reproduzível para identificar, priorizar e propor
  extrações/refatorações com foco em arquitetura limpa, modularização e DRY.
- Prioriza arquivos grandes e trechos repetidos, estimando ganho em linhas de
  código, risco e esforço.

Quando usar

- Ao detectar duplicações ou arquivos grandes em `components/`, `app/` ou
  áreas de domínio (ex.: `scripts`, `publish`, `profile`).
- Ao planejar uma refatoração incremental com validação automatizada e gates
  manuais.

Entradas (parâmetros de execução)

- `scope` (string, opcional): `publish`, `profile`, `scripts`, `all` (default: `all`).
- `overwrite` (boolean, opcional): permitir sobrescrever arquivos locais (default: `false`).
- `branch_prefix` (string, opcional): prefixo para branches criados (default: `feat/refactor`).
- `large_file_lines` (integer, opcional): limiar para considerar "arquivo grande" (default: `150`).
- `duplicate_threshold` (integer, opcional): ocorrências mínimas para considerar um snippet duplicado (default: `3`).
- `min_snippet_lines` (integer, opcional): linhas mínimas de um snippet (default: `5`).

Saída esperada

- `candidates.json`: lista ordenada de candidatos com metadados: `filePath`, `lines`, `duplicationClusters` (occurrences, files, avgLines), `estimatedLinesSaved`, `priorityScore`, `suggestedExtraction`.
- Sketch de componentes/abstrações sugeridas (ex.: `FormField`, `PageShell`, `SectionCard`) com locais de uso.
- Checklist de verificação pós-refactor: `yarn lint`, `yarn type-check`, `yarn test:run`, `yarn build`.

Ferramentas e skills recomendadas

- `grep_search`, `file_search`, `read_file`, `semantic_search` — detecção e análise.
- `simplify` — polimento de mudanças propostas.
- `shadcn`, `nextjs`, `next-best-practices` — padrões de UI e composição.
- `verification-before-completion` — gates finais antes de marcar como concluído.

Fluxo de execução (detalhado)

1. Detectar hotspots
   - Listar arquivos no `scope` (busca por `**/*.{tsx,ts,jsx,js}`) e medir linhas.
   - Marcar "grandes" arquivos (`lines >= large_file_lines`).
2. Detectar duplicações
   - Extrair snippets multi-linha (>= `min_snippet_lines`) contendo JSX ou markup.
   - Normalizar (trim, remover indent, tokenizar literais simples) e gerar fingerprint.
   - Agregar fingerprints e filtrar clusters com `occurrences >= duplicate_threshold`.
3. Calcular métricas e priorizar
   - `estimatedLinesSaved = occurrences * avgLinesPerSnippet`.
   - `priorityScore = estimatedLinesSaved * (1 + log10(lines_in_file + 1))` (heurística ajustável).
   - Preferir candidatos com alto `estimatedLinesSaved` e baixo risco técnico.
4. Gerar sugestões de extração
   - Para cada cluster prioritário, sugerir abstração, arquivos a atualizar e estimativa de esforço (pequeno/médio/grande).
5. Revisão manual e gates
   - Gerar `candidates.json` e resumo legível com exemplos de snippets.
   - Não aplicar patches automaticamente sem aprovação do autor/revisor.
6. Implementação iterativa (opcional)
   - Após aprovação, aplicar extrações uma a uma; rodar lint/type-check/tests após cada mudança.

Critérios de priorização e políticas

- Priorizar `estimatedLinesSaved` (descendente).
- Multiplicar prioridade para arquivos grandes (maior custo de manutenção).
- Evitar alterações em `server/db/schema.ts`, migrations ou RLS.
- Nunca editar `components/ui/` diretamente — crie wrappers em `components/<feature>/`.

Exemplos de prompts (uso)

- "Run `refactor-plan` for scope=scripts, duplicate_threshold=3, large_file_lines=150"
- "Generate extraction candidates for scope=publish and return top 10 by estimatedLinesSaved"

Perguntas que o agente deve fazer ao usuário

- Qual `scope` deseja priorizar? (`publish`, `profile`, `scripts`, `all`)
- Confirmar `large_file_lines` e `duplicate_threshold`.
- Permitir sobrescrever arquivos automaticamente em caso de conflitos? (recomendado: `false`)

Segurança, riscos e edge cases

- Nunca executar migrations, DDL, ou comandos destrutivos automaticamente.
- Se `yarn type-check`/`yarn lint` falharem por erros não relacionados, pausar e solicitar revisão humana.
- Em clusters que incluem lógica (não só markup), marcar como alto risco e exigir revisão manual.

Checklist de conclusão

- [ ] `yarn lint` — sem erros
- [ ] `yarn type-check` — sem erros
- [ ] `yarn test:run` — exit code 0
- [ ] Nenhuma alteração direta em `components/ui/` (usar wrappers)

Notas finais

- Use esta skill como automação de descoberta e priorização; implementação deve ser incremental e revisada pelo time.
- Parâmetros default (`150` linhas, `3` repetições) são recomendação inicial e podem ser adaptados.

---

Fim do `refactor-plan` (Claude).
