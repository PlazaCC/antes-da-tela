---
name: create-agent-skill
description: >-
  Cria e converte uma `SKILL.md` padronizada para uso em VS Code Chat (Copilot
  Chat) e gera a versão adaptada para Claude/Code e outros agentes presentes
  no repositório. Fornece templates, validações e sugestões de conversão.
user-invocable: true
---

# Skill: create-agent-skill (Claude)

Resumo

- Objetivo: gerar uma skill padronizada em `.agents/skills/<skill-name>/SKILL.md`
  e a versão de `Claude` em `.claude/skills/<skill-name>/SKILL.md`, mantendo
  consistência de frontmatter e de exemplos.

Entradas

- `skill_name` (obrigatório)
- `description` (recomendado)
- `targets`: `vscode`, `claude`, `both` (default `both`)
- `overwrite`: `true|false` (default `false`)

Fluxo

1. Validar entradas.
2. Detectar arquivos existentes; em caso de conflito, gerar diff e pedir
   confirmação.
3. Gerar templates adaptados ao estilo Claude (linguagem de instrução mais
   orientada a tarefas) e salvar.
4. Validar frontmatter e sugerir ações (PR, lint, testes).

Templates (exemplo curto)

```
---
name: <skill-name>
description: <Descrição curta>
user-invocable: true
---

# <Skill Title> (Claude)

Resumo

- O que faz e quando usar.

Passos

1. Ação 1
2. Ação 2

Exemplo de prompt

- "Gere uma skill X que..."
```

Notas de conversão

- Adeque o tom: VS Code → conciso; Claude → explicativo/instrucional.
- Preserve chaves essenciais do frontmatter; acrescente `applyTo` quando
  pertinente para regras de repositório.

Perguntas úteis

- Deseja sobrescrever arquivos existentes?
- Quais `applyTo` paths devem ser incluídos na skill (se aplicável)?

---

Fim da skill.
