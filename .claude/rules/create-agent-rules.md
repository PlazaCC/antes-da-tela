# create-agent-rules — Regras e templates para agentes

Resumo

- Objetivo: automatizar a criação e padronização de arquivos de regras/guidelines
  para agentes no repositório (Claude e VS Code Chat), fornecendo templates
  e verificações básicas.

Quando usar

- Ao adicionar ou padronizar políticas que agentes devem seguir (UI, Supabase,
  componentes, segurança, etc.).
- Quando for necessário gerar templates iniciais em `.claude/rules/` ou
  `.agents/rules/` a partir de uma skill existente.

Parâmetros de entrada

- `targets` (opcional): `claude`, `vscode`, `both`. Padrão: `both`.
- `folders` (opcional): caminhos a analisar/atualizar. Padrão: `.claude/rules/`,
  `.agents/skills/`, `.agents/rules/`.
- `overwrite` (boolean): sobrescrever arquivos existentes? Padrão: `false`.
- `scope` (opcional): `workspace` ou `user`. Padrão: `workspace`.

Processo resumido

1. Validar parâmetros recebidos; perguntar ao usuário se faltar informações.
2. Escanear os diretórios padrão por arquivos de regras e skills existentes.
3. Detectar o estilo da pasta alvo (`.claude/rules` = Markdown; `.agents/*` =
   SKILL.md com frontmatter) e preservar o padrão ao gerar novos arquivos.
4. Gerar template por tópico solicitado (ex.: `ui`, `supabase`, `components`).
5. Se arquivo existe e `overwrite=false`, solicitar confirmação com diff.
6. Escrever arquivos e executar validações (frontmatter, comprimento, `name`).
7. Reportar a lista de arquivos criados/alterados e próximos passos.

Templates rápidos

- Template para `.claude/rules/<topic>.md`:

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

- Template para `.agents/rules/<topic>.md`:

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

- Template para `SKILL.md` (skill que documenta/automatiza regras):

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
```

Validações e critérios de qualidade

- Em `SKILL.md`, o `name` deve coincidir exatamente com o nome do diretório.
- Evitar tabs em YAML; usar espaços.
- `description` obrigatório em skills e prompts.
- Arquivos `.claude/rules/*` podem ser Markdown livre; preserve o estilo
  existente.
- Não exceder 150 linhas por arquivo de regra; dividir se necessário.

Boas práticas

- Use `skills` para fluxos multi-etapa e `prompts` para tarefas simples.
- Documente claramente `when to use` e `inputs` em cada arquivo novo.
- Ao gerar wrappers de UI (shadcn), crie arquivos em `components/<feature>/` —
  não edite `components/ui/` manualmente.

Perguntas a fazer ao usuário

- Deseja que eu sobrescreva arquivos existentes? (yes/no)
- Quais tópicos devo gerar primeiro? (lista separada por vírgulas)
- Deseja que eu crie um PR automaticamente com as mudanças? (yes/no)

---

Arquivo gerado automaticamente a partir da SKILL `create-agent-rules`.
