---
name: refactor-plan
description: Plano executável para refatorações arquiteturais: modularização, remoção de duplicação e priorização por ganho de redução de código e consistência.
user-invocable: true
---

# Refactor Plan — Plano de Refatoração Arquitetural

Resumo

- Objetivo: gerar um processo reproduzível para detectar e priorizar oportunidades de refatoração com foco em arquitetura limpa, modularização e eliminação de duplicação (DRY). Prioriza arquivos grandes e trechos de código repetidos ≥ 3 vezes, estimando ganho em linhas de código e consistência.

Quando usar

- Ao identificar acúmulos de markup/logic similares em `components/`, `app/` ou áreas de domínio (ex.: `scripts`, `publish`, `profile`).
- Quando o objetivo for reduzir volume de código, aumentar consistência e facilitar testes/reatribuição de responsabilidades.

Entradas (parâmetros)

- `scope` (string | optional): área alvo — `publish`, `profile`, `scripts`, `all`. Default: `all`.
- `overwrite` (boolean | optional): permitir sobrescrever arquivos locais quando aplicável. Default: `false`.
- `branch_prefix` (string | optional): prefixo do branch. Default: `feat/refactor`.
- `large_file_lines` (integer | optional): limiar para considerar "arquivo grande". Default: `150` (baseado nas regras do repo: meta 100, hard limit 150).
- `duplicate_threshold` (integer | optional): ocorrências mínimas para considerar um snippet como duplicação problemática. Default: `3`.
- `min_snippet_lines` (integer | optional): linhas mínimas de um snippet para ser considerado. Default: `5`.

Saída esperada

- `candidates.json` (resumo): lista de candidatos ordenados por `priorityScore`. Cada item inclui: `filePath`, `lines`, `duplicationClusters` (occurrences, files, avgLines), `estimatedLinesSaved`, `priorityScore`, `suggestedExtraction`.
- SKETCH de componentes a extrair (ex.: `FormField`, `PageShell`, `SectionCard`, `SectionHeading`) com localizações de uso.
- Checklist de verificação: `yarn lint`, `yarn type-check`, `yarn test:run`, `yarn build`.

Ferramentas/skills usadas

- `grep_search`, `file_search`, `read_file`, `semantic_search` (para detecção inicial).
- `simplify` — polimento das alterações propostas.
- `shadcn`, `nextjs`, `next-best-practices` — para aplicar padrões do projeto (wrappers, `asChild`, RSC/client boundaries).
- `verification-before-completion` — gates finais antes de considerar pronto.

Processo (passo-a-passo)

1. Detectar hotspots
   - Listar arquivos no `scope` (`file_search` com `**/*.{tsx,ts,jsx,js}`) e medir `lines` (usar `read_file` e contar linhas).
   - Marcar como "grande" arquivos com `lines >= large_file_lines`.
2. Detectar duplicações
   - Para cada arquivo, extrair snippets multi-linha (>= `min_snippet_lines`) que contenham elementos JSX ou markup repetido.
   - Normalizar snippets (trim, remover espaçamento/indent, substituir literais simples por tokens) e gerar fingerprint (hash).
   - Agregar fingerprints e filtrar clusters com `occurrences >= duplicate_threshold`.
3. Calcular métricas e priorizar
   - `estimatedLinesSaved = occurrences * avgLinesPerSnippet`.
   - `priorityScore = estimatedLinesSaved * (1 + log10(lines_in_file + 1))` (heurística; ajustar conforme necessidade).
   - Preferir candidatos com alto `estimatedLinesSaved` e baixo risco (UI-only vs lógica de domínio).
4. Gerar sugestões de extração
   - Para cada cluster prioritário, sugerir abstração (componente/pattern), locais a atualizar e uma estimativa de esforço (pequeno/medio/grande).
5. Revisão manual e gates
   - Produzir `candidates.json` e um resumo legível com exemplos de snippets.
   - Não aplicar patches automaticamente — aguardar aprovação do autor.
6. (Opcional) Implementação iterativa
   - Ao aprovar, aplicar 1 extração por vez, rodar `yarn lint`/`type-check`/`test:run` após cada alteração.

Critérios de priorização (regras práticas)

- Priorizar por `estimatedLinesSaved` (maior primeiro).
- Arquivos grandes recebem multiplicador (problemas ali tendem a ter maior custo de manutenção).
- Preferir refatorações que não toquem `server/db/schema.ts`, migrations ou RLS.
- Evitar editar diretamente `components/ui/` — criar wrappers em `components/<feature>/`.

Exemplos de prompts

- "Run `refactor-plan` for scope=scripts, duplicate_threshold=3, large_file_lines=150"
- "Generate extraction candidates for scope=publish and return top 10 by estimatedLinesSaved"

Perguntas a fazer ao usuário (quando necessário)

- Qual `scope` deseja priorizar? (`publish`, `profile`, `scripts`, `all`)
- Confirmar `large_file_lines` (padrão `150`) e `duplicate_threshold` (padrão `3`).
- Permitir sobrescrever arquivos automaticamente se houver conflitos? (recomendado: `false`)

Segurança e edge cases

- Nunca executar migrations ou comandos DDL automaticamente.
- Se `yarn type-check`/`yarn lint` falharem por erros não relacionados às mudanças, pausar e solicitar revisão humana.
- Em clusters que envolvem lógica (não só markup), marcar como maior risco e exigir revisão manual.

Checklist final antes de considerar pronto

- [ ] `yarn lint` — sem erros
- [ ] `yarn type-check` — sem erros
- [ ] `yarn test:run` — exit code 0
- [ ] Não há alterações diretas em `components/ui/` (apenas wrappers em `components/*`)

Notas finais

- Use este skill como uma automação de descoberta e priorização — a execução das extrações deve ser incremental e revisada pelo time.
- Valores default (`150` linhas, `3` repetições) podem ser alterados por parâmetro.

---

Fim do `refactor-plan`.
