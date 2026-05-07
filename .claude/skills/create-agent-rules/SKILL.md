---
name: create-agent-rules
description: >-
  **Cria e padroniza arquivos de "rules" e guidelines para agentes no repositório.
  Gera templates compatíveis com o VS Code Chat (Copilot Chat) e com o fluxo
  Claude/Code, adaptando o formato ao diretório alvo (`.agents/*` ou `.claude/*`).
user-invocable: true
---

# Skill: create-agent-rules

Resumo

- Propósito: automatizar a criação de arquivos de "rules" e guidelines para agentes,
  seguindo as melhores práticas do VS Code Chat nativo e as convenções do repositório.
- Onde escrever: `.agents/skills/<name>/SKILL.md` (skill de automação) e, quando
  aplicável, templates em `.claude/rules/` ou `.agents/rules/`.

Quando usar

- Você quer adicionar ou padronizar políticas, convenções e regras que o agente
  deve seguir ao trabalhar neste repositório (estilo, segurança, operações DB, UI,
  etc.).
- Deseja gerar um conjunto de arquivos `rules` para diferentes agentes (Claude,
  VS Code chat) a partir de um único prompt e com validações automáticas.

Entrada (parâmetros que o agente deve pedir se ausentes)

- `targets` (opcional): lista de destinos a gerar — possíveis valores: `claude`,
  `vscode`, `both`. Default: `both`.
- `folders` (opcional): caminhos específicos a analisar/atualizar. Se omitido,
  escaneará padrões padrão no repo: `.claude/rules/`, `.agents/skills/`,
  `.agents/rules/`.
- `overwrite` (bool): permitir sobrescrever arquivos existentes? Default: `false`.
- `scope` (opcional): `workspace` ou `user`; define onde salvar (workspace por
  padrão).

Saída esperada

- Cria/atualiza: `.agents/skills/create-agent-rules/SKILL.md` (esta skill)
- Opcionalmente gera templates iniciais em `.claude/rules/<topic>.md` e
  `.agents/rules/<topic>.md` ou atualiza arquivos existentes conforme confirmação.
- Retorna lista de arquivos criados e modificados com caminhos e resumo.

Processo (passo-a-passo que o agente deve executar)

1. Detectar e validar parâmetros de entrada; perguntar ao usuário quando faltar.
2. Escanear o repositório pelos diretórios-padrão:
   - `.claude/rules/`
   - `.agents/skills/`
   - `.agents/rules/`
   - quaisquer outras pastas `rules` detectadas.
3. Para cada pasta detectada, determinar o estilo existente:
   - `.claude/rules/`: tipicamente Markdown livre com headings; pode ter
     frontmatter ocasional — preserve o padrão existente ao criar novos arquivos.
   - `.agents/*`: skills e instruções seguem um padrão SKILL.md com frontmatter
     `name:` obrigatório — crie templates SKILL.md quando aplicável.
4. Gerar um template por tópico requerido (ex.: `ui.md`, `supabase.md`,
   `components.md`) usando o formato apropriado (veja Templates abaixo).
5. Antes de escrever, se um arquivo existir e `overwrite=false`, solicitar
   confirmação do usuário com `diff` resumido; se `overwrite=true`, sobrescrever
   automaticamente (ainda assim tomando cuidado com arquivos binários).
6. Escrever arquivos usando as ferramentas do ambiente (`create_file`/`apply_patch`).
7. Validar: checar presença de frontmatter quando pertinente, verificar regras
   de estilo (ex.: comprimento de arquivo, presença de `description`), e reportar
   erros ou avisos.
8. Produzir um resumo final com caminhos dos arquivos criados/alterados e próximos
   passos sugeridos (ex.: enviar PR, rodar `yarn lint`).

Templates (use e adapte conforme o destino)

- Template para `.claude/rules/<topic>.md` (Markdown focal)

```
# <Topic Title>

Uma breve introdução do objetivo desta regra.

## Diretrizes principais

- Item 1: descrição curta e prática.
- Item 2: quando aplicar.

## Exemplos

- Exemplo mínimo de uso ou anti-padrão.

## Verificações
- Checklist de validação (frontmatter, tamanho do arquivo, applyTo?)
```

- Template para `.agents/rules/<topic>.md` (se optar por `.agents/rules`)

```
---
name: <topic>
description: Regras e convenções para <topic> aplicadas ao agente VS Code Chat
---

# <Topic Title>

Contexto e objetivo.

## Regras
- R1: descrição curta.
- R2: descrição curta.

## Checklist
- [ ] Frontmatter correta
- [ ] Tamanho do arquivo ≤ 150 linhas
```

- Template para `SKILL.md` (no caso de criar uma skill que documente uma regra)

```
---
name: <skill-name>
description: Curta descrição do que a skill faz
user-invocable: false
---

# <Skill Title>

Resumo e quando usar.

## Passos
1. Passo 1
2. Passo 2

## Exemplos de uso
- Prompt: "Crie uma regra sobre X"
```

Validações e critérios de qualidade (sempre executar)

- `name` no frontmatter de `SKILL.md` deve bater exatamente com o nome do diretório.
- Evitar tabs em YAML; usar espaços.
- `description` obrigatório em skills e prompts.
- Arquivos `.claude/rules/*` podem ser livres; detecte e preserve estilo existente.
- Não exceder 150 linhas por regra (use `split` quando necessário).

Boas práticas extraídas dos guias do VS Code Chat e do repositório

- Prefira `applyTo` granulares em instruções que não valem para todo o repo.
- Prefira `skills` para fluxos multi-etapa; `prompts` para tarefas simples.
- Documente claramente `when to use` e `inputs` para cada arquivo de regras.

Exemplos de prompts para invocar esta skill

- "Gere regras iniciais para `ui`, `supabase` e `components` em `.claude/rules` e
  `.agents/rules`, sem sobrescrever arquivos existentes."
- "Padronize os arquivos em `.claude/rules` seguindo as melhores práticas do
  VS Code Chat; sobrescrever arquivos existentes."

Edge cases e comportamentos seguros

- Se detectar migrações de estilo (ex.: arquivos com frontmatter mistos), pedir
  confirmação antes de normalizar automaticamente.
- Nunca executar comandos de banco de dados automaticamente — só gerar docs.
- Em caso de conflito de nomes, sugerir sufixos (`-v2`) e avisar o usuário.

Perguntas a fazer ao usuário quando necessário

- Deseja que eu sobrescreva arquivos existentes se encontrá-los? (yes/no)
- Quais tópicos devo gerar primeiro? (lista separada por vírgulas)
- Deseja que eu crie PR automaticamente com as mudanças? (yes/no)

---

Fim da skill.
