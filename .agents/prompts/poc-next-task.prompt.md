---
name: poc-next-task
agent: agent
description: >-
  Prompt para a skill `poc-next-task` — automatiza a identificação da próxima
  task POC, valida critérios de aceite, consome o MCP Figma (Framelink) para
  extrair tokens/artefatos quando necessário e atualiza automaticamente os
  checklists em `.agents/tasks/*`. Projetado para uso por um agente com acesso
  a ferramentas de I/O e ao MCP do Figma.
tools:
  [
    vscode,
    execute,
    read,
    agent,
    edit,
    search,
    web,
    'framelink_figma_mcp/*',
    'io.github.upstash/context7/*',
    'playwright/*',
    'plaza.mcp/*',
    browser,
    todo,
  ]
inputs:
  task_id:
    type: string
    description: 'ID opcional da task (ex: poc-01). Se omitido, detecta a próxima pendente a partir de .agents/poc-context.json'
  figma_fileKey:
    type: string
    description: 'Opcional: fileKey do Figma. Se omitido, usa .agents/figma.meta.json.fileKey ou .agents/design-system.meta.json'
  dry_run:
    type: boolean
    default: true
    description: 'Se true, apenas reporta ações; não modifica arquivos nem comita'
  auto_commit:
    type: boolean
    default: false
    description: 'Se true e dry_run=false, aplica mudanças nos arquivos e cria commit Git (pede confirmação se necessário)'
---

Descrição curta

Este prompt orienta o agente a executar o fluxo padrão da skill `poc-next-task`:

1. identificar a próxima task POC ou usar `task_id`; 2) rodar validações locais
   (`yarn build`, `yarn lint`, `yarn drizzle-kit generate` quando aplicável); 3)
   consultar o Figma via MCP FramLink para extrair tokens ou assets (quando o task
   requer design), 4) atualizar checklists em `.agents/tasks/*.md` marcando itens
   concluídos; 5) opcionalmente commitar as mudanças.

Regras operacionais

- Antes de qualquer escrita, verificar `dry_run`. Se `dry_run: true`, só gerar o
  relatório das ações pretendidas.
- Se `auto_commit: true`, pedir confirmação explícita antes de executar o
  comando `git commit` (a menos que o ambiente permita commits automáticos).
- Ao operar sobre checklists, suportar dois formatos comuns:
  - Markdown checklist: `- [ ] Item` -> `- [x] Item`
  - YAML/JSON-like: `done: false` -> `done: true`
- Sempre preservar histórico: ao editar arquivos, usar `apply_patch` (ou a
  ferramenta de escrita adequada) e criar um commit com mensagem padronizada.

Passo-a-passo que o agente deve seguir

1. Carregar contexto local
   - Ler `.agents/poc-context.json` para `execution_order` e `tasks`.
   - Ler `.agents/tasks/poc-overview.md` e o arquivo da task alvo
     (ex.: `.agents/tasks/poc-01-design-system.md`).
   - Ler `.agents/figma.meta.json` e `.agents/design-system.meta.json` para
     valores padrão de `fileKey` e tokens.

2. Determinar a task alvo
   - Se `task_id` fornecido, usar esse ID.
   - Caso contrário, selecionar a primeira task listada em
     `execution_order` que esteja `pending` ou `in_progress` conforme
     `.agents/poc-context.json` (ou usar heurística similar).

3. Validar critérios de aceite localmente
   - Executar os comandos relevantes via `run_in_terminal` e coletar saída:
     - `yarn build`
     - `yarn lint`
     - Se `server/db/schema.ts` foi alterado ou task menciona DB: `yarn drizzle-kit generate`
   - Interpretar sucesso/erro a partir dos códigos de saída e stdout/stderr.

4. Consultar Figma via MCP (quando necessário)
   - Se a task requer design (identificado pelo campo `files_affected` ou
     pelo escopo da task), chamar `mcp_framelink_fig_get_figma_data` com
     `fileKey` (do input ou de `.agents/figma.meta.json`) e opcional `nodeId`.
   - Extrair tokens relevantes (cores, tipografia) ou assets SVG e salvar como
     artefatos locais se solicitado.

5. Atualizar checklists
   - Para cada item de acceptance checklist que já estiver comprovadamente
     satisfeito (p.ex. build/lint ok, migration gerada), atualizar o arquivo
     `.agents/tasks/<task>.md`:
     - Substituir `- [ ]` por `- [x]` para itens concluídos.
     - Ou alterar `done: false` → `done: true` se for esse o formato.
   - Se `dry_run: true`, apenas gerar diff/relatório sem gravar.
   - Se `dry_run: false`, aplicar mudanças com `apply_patch` (ou `create_file`),
     e, se `auto_commit: true`, criar commit com a mensagem:

     "poc({task_id}): mark acceptance items as done — {short list of items}"

6. Registrar progresso no TODO do agente
   - Atualizar `manage_todo_list` para refletir progresso (opcional, mas
     recomendado). Use o padrão do repositório para mensagens/formatos.

7. Relatório final
   - Entregar um resumo curto indicando:
     - Task processada
     - Validações rodadas + resultados
     - Itens de checklist atualizados (listar)
     - Arquivos alterados e commit criado (se aplicável)
     - Próximo passo recomendado

Segurança e confirmação

- Nunca execute commits ou pushes sem confirmação quando não for explicitamente
  autorizado (`auto_commit: false` por padrão).
- Se a operação requer chaves/segredos para MCP, reporte que precisa do token e
  peça instruções; não grave tokens em arquivos de projeto.

Padrões de edição de checklist (exemplos)

- Markdown checklist (exemplo de transformação):

  Antes:
  - [ ] yarn build passes
  - [ ] yarn lint passes

  Depois:
  - [x] yarn build passes
  - [x] yarn lint passes

- YAML/inline (exemplo):

  Antes: `- name: build; done: false`
  Depois: `- name: build; done: true`

Exemplos de invocação

1. Apenas inspecionar (dry-run):

{
"task_id": "poc-01",
"dry_run": true
}

2. Executar validações e aplicar mudanças + commitar:

{
"task_id": "poc-01",
"dry_run": false,
"auto_commit": true
}

Perguntas a fazer ao usuário antes de alterar o repositório

- Deseja que eu aplique as mudanças (dry_run=false) ou só reporte (dry_run=true)?
- Deseja que eu crie o commit automaticamente (auto_commit=true)?
- Qual `figma_fileKey` usar (se diferente do meta.json)?

Notas de implementação para o agente

- Priorize leitura de `.agents/poc-context.json` e dos arquivos em
  `.agents/tasks/` para entender os metadados do POC.
- Ao chamar o MCP do Figma, prefira pedir apenas as páginas/nodes necessários
  (tokens e componentes) para reduzir payload.
- Mantenha as mudanças mínimas e focadas: apenas marque checklist e não
  reescreva seções não relacionadas.

---

File created by agent-template: poc-next-task.prompt.md
