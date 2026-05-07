---
name: create-agent-skill
description: >-
  Cria uma `SKILL.md` padronizada para uso em VS Code Chat (Copilot Chat) e
  gera a versão correspondente adaptada para outros agentes do repositório
  (ex.: Claude). Automatiza frontmatter, templates e validações básicas.
user-invocable: true
---

# Skill: create-agent-skill (VS Code Chat)

Resumo

- Propósito: gerar SKILLs padronizadas em `.agents/skills/<skill-name>/SKILL.md`
  e opcionalmente criar a contraparte em `.claude/skills/<skill-name>/SKILL.md`.
- Quando usar: padronizar skills novas, converter skills existentes para o
  formato do VS Code Chat / Claude ou criar boilerplate para novas automações.

Entrada (parâmetros)

- `skill_name` (string) — nome da skill / diretório (requerido).
- `description` (string) — curta descrição da skill (opcional, recomendada).
- `targets` (string[]) — onde criar: `vscode`, `claude`, ou `both`. Default: `both`.
- `user_invocable` (bool) — se a skill será invocável pelo usuário. Default: `true`.
- `overwrite` (bool) — sobrescrever arquivos existentes? Default: `false`.
- `applyTo` (optional) — paths onde a regra se aplica (opcional para skills de regras).

Saída esperada

- Cria as pastas necessárias e escreve os arquivos:
  - `.agents/skills/<skill_name>/SKILL.md`
  - opcionalmente `.claude/skills/<skill_name>/SKILL.md`
- Retorna lista de arquivos criados/alterados e avisos sobre conflitos.

Processo (passo-a-passo)

1. Valida `skill_name` (caracteres permitidos) e que o diretório alvo não contenha
   caracteres inválidos.
2. Detecta `targets`; se ausente pergunta ao usuário (prompt interativo).
3. Se existir arquivo e `overwrite=false`, mostra um diff resumido e pede
   confirmação antes de sobrescrever.
4. Gera conteúdo baseado em templates (veja seção Templates) e escreve com
   frontmatter consistente (`name`, `description`, `user-invocable`).
5. Para a versão Claude, adapta o texto e mantém as chaves essenciais do
   frontmatter; converte exemplos e prompts para um estilo mais orientado a
   instruções caso necessário.
6. Validações pós-gravação: frontmatter presente, `name` bate com o diretório,
   comprimento do arquivo ≤ 400 linhas (skill longa ok, mas recomenda-se sucinta).
7. Retorna resumo e caminhos; sugere próximo passo (criar PR, rodar `yarn lint`).

Templates

- Template mínimo para `.agents/skills/<name>/SKILL.md`:

```
---
name: <skill-name>
description: <Descrição curta da skill>
user-invocable: <true|false>
---

# <Skill Title>

Resumo

- O que faz: ...

Entrada

- `param1`: descrição

Processo

1. Passo 1
2. Passo 2

Exemplos de prompts

- "Crie uma regra X"
```

- Template correspondente em `.claude/skills/<name>/SKILL.md` (adaptação de estilo):

```
---
name: <skill-name>
description: <Descrição curta da skill, estilo Claude>
user-invocable: <true|false>
---

# <Skill Title> (Claude)

Resumo e quando usar

Passos rápidos

1. Passo A
2. Passo B

Exemplos de prompt

- "Gere um conjunto de regras para X"
```

Conversão e mapeamento de campos

- `name` → mantido.
- `description` → mantida, mas adaptar tom entre conciso (VS Code) e
  orientado a instruções (Claude) quando apropriado.
- `user-invocable` → mantido.

Validações e boas práticas

- `name` no frontmatter deve bater com o nome da pasta (ex.: `create-agent-skill`).
- Use espaços (não tabs) no frontmatter YAML.
- `description` é obrigatório para skills públicas.
- Evite longos blocos de código não documentados; prefira exemplos curtos.

Edge cases

- Se detectar um arquivo com frontmatter misto (ex.: chaves adicionais), não
  remova automaticamente; proponha um diff e peça confirmação.
- Em caso de conflito de nomes, sugira sufixos (`-v2`) e não sobrescreva.

Perguntas a fazer ao usuário (quando input ausente)

- Deseja criar a versão Claude também? (yes/no)
- Posso sobrescrever arquivos existentes? (yes/no)
- Qual o `description` da skill?

Exemplos de uso

- "Crie uma skill chamada `generate-issue-body` com descrição 'Gera issue body a partir de diff' e gere versão para Claude também."

---

Fim da skill.
