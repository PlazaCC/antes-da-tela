---
name: poc-last-task-refine-design
agent: agent
description: >-
  Prompt de apoio para refinar o design da última task POC realizada. Baseado na
  skill `poc-next-task`, este prompt foca em: identificar a task alvo (última
  task realizada ou `task_id` fornecido), consultar o Figma via FramLink MCP,
  comparar e limpar redundâncias entre o Figma extraído e o `.agents/design-system`,
  aplicar correções de tokens e componentes no escopo da task e atualizar
  checklists em `.agents/tasks/*`.
tools: [vscode, read, edit, apply_patch, search, 'framelink_figma_mcp/*', todo, 'plaza.mcp/*']
inputs:
  task_id:
    type: string
    description: 'Opcional: ID da task (ex: poc-07). Se omitido, detecta a última task realizada ou a próxima pendente a partir de .agents/poc-context.json'
  figma_fileKey:
    type: string
    description: 'Opcional: fileKey do Figma. Se omitido, usa .agents/figma.meta.json.fileKey'
  apply_changes:
    type: boolean
    description: 'Se true, grava as mudanças locais (apply_patch). Default: false (dry run)'
  dry_run:
    type: boolean
    description: 'Se true, não grava arquivos; apenas gera diff e relatório. Default: true'
  commit_suggestion:
    type: boolean
    description: 'Se true, gera sugestão de Conventional Commit para aplicar manualmente. Default: true'
---

Resumo curto

Este prompt guia um agente a executar refinamentos de design específicos para a
última task POC concluída ou para um `task_id` fornecido. Workflow principal:

1. Carregar contexto local: `.agents/poc-context.json`, `.agents/tasks/*`,
   `.agents/figma.meta.json`, `.agents/design-system.meta.json` e
   `.agents/design-system.plan.md`.
   - Antes de consultar o MCP, verificar se há assets locais em `.agents/figma/`.
     - Use `.agents/figma/components/*.svg`, `.agents/figma/frames/*.pdf|png` e `.agents/figma/screens/*` quando presentes.
     - Registrar paths dos assets consumidos e preferir assets locais para comparações e diffs (reduz payload e facilita reproducibilidade).
2. Determinar task alvo: usar `task_id` se fornecido; caso contrário, escolher a
   última task com status `in_progress` ou `pending` conforme `execution_order`.
3. Extrair referências de design da task alvo (componentes, nodes, tokens).

Escopo e restrição (AJUSTE SOLICITADO)

- Este prompt deve manter-se estritamente no escopo da task alvo e das
  dependências imediatas (tasks listadas em `execution_order`), para evitar
  regressões em trabalho previamente concluído.
- Objetivos adicionais: enriquecer a UI do escopo tratado de forma incremental
  e detectar gaps visuais ou tokens faltantes que impactem a task atual ou as
  dependências próximas. Não execute mudanças globais sem validação manual.

4. Consultar o Figma via FramLink MCP (`mcp_framelink_fig_get_figma_data`) usando
   `figma_fileKey` e os `nodeId`s relevantes. Baixar apenas nodes necessários.
5. Comparar: `design-system.meta.json` vs dados extraídos do Figma. Detectar:
   - tokens faltantes ou divergentes (cores, tipografia, spacing)
   - componentes duplicados/obsoletos
   - assets SVG ou imagens ausentes
6. Limpeza e atualização:
   - remover redundâncias no `.agents/design-system.meta.json` ou marcar
     componentes como `asset` vs `component` conforme o Figma
   - normalizar tokens em formato esperado pelo projeto (HSL channels quando
     aplicável) e atualizar `design-system.plan.md` quando houver alteração de
     estratégia
   - gerar diffs/patches mínimos para atualizar arquivos locais extraídos

Diretrizes operacionais (escopo restrito)

- Priorize apenas os `nodeId`s e componentes referenciados diretamente na task
  alvo e em tasks dependentes imediatas. Evite tocar tokens ou componentes que
  não impactem a entrega da task.
- Prefira assets locais em `.agents/figma/` para comparação e export (reduz
  payload e garante reprodutibilidade).
- NÃO modificar `components/ui/*` de forma ampla. Alterações em UI só são
  permitidas se forem mínimas, localizadas e claramente não causarem
  regressão (ex.: extrair wrapper, adicionar prop pass-through). Para mudanças
  maiores, gere uma sugestão de PR/issue em vez de aplicar automaticamente.
- Converter hex→HSL somente quando `poc-context.json.tokens_format` exigir.
- Ao atualizar `.agents/design-system.meta.json`, preserve referências e
  notas existentes; faça consolidações mínimas e documente o motivo.

7. Aplicar mudanças e checklists:
   - se `apply_changes=true` e `dry_run=false`, aplicar patches com
     `apply_patch` (NÃO executar `git commit` nem `git push`)
   - atualizar checklist de acceptance na task alvo em `.agents/tasks/*.md`
     marcando apenas itens que foram verificadamente atendidos

Critérios de verificação (quando marcar acceptance como done)

- Só marque um acceptance item como `done` se a evidência for localmente
  verificável (ex.: token existe em `.agents/design-system.meta.json`, asset
  SVG salvo em `.agents/figma/components/`, ou componente adicionado em
  `components/ui/` como mudança mínima). Se a verificação exigir build ou QA
  visual, adicione uma entrada na checklist indicando verificação manual
  pendente.

8. Entregar relatório resumido com:
   - task processada
   - dados Figma extraídos (nodes consultados)
   - lista de mudanças propostas/aplicadas (arquivos + trechos)
   - items de checklist atualizados
   - sugestão de Conventional Commit (se `commit_suggestion=true`)

Regras operacionais

- Sempre pedir token MCP Figma se chamada ao FramLink falhar por permissões.
- Não criar commits ou fazer push automaticamente.
- Fazer mudanças mínimas: evitar reescrever seções não relacionadas.
- Validar tokens convertendo hex→HSL quando o projeto exige HSL (ver
  `poc-context.json.tokens_format`).

Passo-a-passo detalhado que o agente deve seguir

1. Ler `.agents/poc-context.json` e determinar a `execution_order` e `tasks`.
2. Determinar task alvo:
   - usar `task_id` se fornecido.
   - senão, selecionar a última task com `status` in ["in_progress","pending"]
     na ordem de `execution_order`. Priorizar a última numericamente (ex: poc-07).
3. Ler o arquivo da task alvo em `.agents/tasks/` e identificar referências de
   design (nomes de componentes, nodeIds, tokens). Ex.: `StarRating`, `RatingBox`, `Avatar`, `ScriptCard`.
4. Ler `.agents/figma.meta.json` para `fileKey` (a menos que `figma_fileKey`
   seja fornecido). Mapear componentes para `nodeId`s usando o campo
   `components` do `figma.meta.json`.
5. Chamar `mcp_framelink_fig_get_figma_data` com `fileKey` e `nodeId`s necessários
   (páginas `Foundations` e frames referenciados). Solicitar apenas nodes usados
   pela task para minimizar payload.
6. Extrair e comparar:
   - cores: comparar paleta atual em `.agents/design-system.meta.json` com
     cores extraídas; detectar nomes duplicados, valores divergentes e tokens
     redundantes.
   - tipografia: mapear escalas do Figma vs escalas do meta; identificar
     faltantes.
   - componentes: para cada componente referenciado pela task, verificar se o
     `figmaNodeId` e o `type` em `.agents/design-system.meta.json` estão coerentes.
7. Resolver redundâncias:
   - quando dois tokens representam a mesma cor (mesmo hex/hsl), consolidar e
     atualizar referências no meta e no plano. Não tocar arquivos de código
     além do `.agents/*` a menos que `apply_changes=true`.
   - marcar claramente no `design-system.meta.json` o que é `component` vs
     `asset` (imagem/SVG) para evitar confusão na implementação.
8. Gerar patches mínimos:
   - atualizar `.agents/design-system.meta.json` com correções
   - atualizar `.agents/design-system.plan.md` caso o plano precise refletir
     a nova prioridade ou mudanças de tokens
   - atualizar o arquivo de task `.agents/tasks/<task-file>.md` marcando os
     acceptance items verificados como concluídos
9. Aplicação segura:
   - se `dry_run=true`, produzir apenas um diff e um relatório sem gravar
   - se `apply_changes=true` e `dry_run=false`, gravar via `apply_patch` e
     atualizar o todo (usar `todo` tool) para refletir progresso
10. Relatório final (resumido):

- task alvo
- nodes Figma consultados
- alterações propostas e/ou aplicadas
- checklist atualizado
- comentário sobre próximos passos e riscos

Perguntas mínimas ao usuário (quando necessário)

- Deseja aplicar as mudanças localmente agora (apply_changes=true) ou apenas
  gerar um relatório (dry_run=true)?
- Posso usar o `figma_fileKey` de `.agents/figma.meta.json` ou você prefere
  outro arquivo? (default: usar meta.json)

Exemplos de invocação

1. Inspecionar sem gravar (padrão seguro):

{
"dry_run": true
}

2. Aplicar mudanças mínimas e gerar sugestão de commit:

{
"task_id": "poc-07",
"apply_changes": true,
"dry_run": false,
"commit_suggestion": true
}

Observações finais

Este prompt assume que o agente tem permissões para ler arquivos em
`.agents/` e chamar o MCP FramLink. Se a chamada ao FramLink exigir credenciais
que não estão disponíveis, o agente deve parar e pedir o token em vez de
tentar gravar valores incompletos.
