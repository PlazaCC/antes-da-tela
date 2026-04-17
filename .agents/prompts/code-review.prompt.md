---
name: code-review
agent: agent
description: |
  Realiza code review automatizado do código atual, mas só se você NÃO estiver na branch main. Se estiver na main, pare imediatamente e alerte o usuário para trocar de branch antes de prosseguir.
  Use sempre as skills de React/Vercel e Supabase para entender a arquitetura da aplicação, incluindo @file:vercel-react-best-practices, as skills relacionadas a Supabase e o guia de workflow @file:supabase-workflow.md.
tools:
  [
    vscode,
    execute,
    read,
    agent,
    edit,
    search,
    web,
    'io.github.upstash/context7/*',
    'playwright/*',
    browser,
    'gitkraken/*',
    todo,
  ]
---

# Code Review com Diferença para main

## Objetivo

Automatizar o code review da branch atual, analisando detalhadamente o conteúdo dos arquivos alterados em relação à branch main. O agente deve identificar problemas concretos, sugerir correções e montar um plano de ação claro. Se estiver na main, interrompa e alerte.

## Passos

1. Verifique a branch atual usando comando git.
2. Se estiver na main, pare e alerte: "Você está na branch main. Troque de branch antes de rodar o code review!"
3. Se não estiver na main, siga com o code review:
   - Liste todos os arquivos alterados em relação à main (use `git diff --name-status main...HEAD`).
   - Analise erros de compilação/lint apenas nos arquivos alterados.
   - Leia o conteúdo dos arquivos alterados e aponte problemas concretos (bugs, más práticas, violações de padrão, código morto, duplicidade, falta de teste, etc).
   - Sugira melhorias, refatorações e aponte problemas apenas no que mudou.
   - Monte um plano de correção detalhado, em formato de TODOs, com ações específicas para cada problema encontrado.

## Inputs

- Nenhum argumento obrigatório. O prompt atua no contexto do projeto atual.

## Output

- Alerta se estiver na main.
- Caso contrário, relatório de code review com:
  - Lista dos arquivos alterados
  - Lista de problemas concretos encontrados (com trechos de código, se possível)
  - Plano de correção detalhado (TODOs claros e objetivos, um por ação)

## Exemplo de uso

- "Rodar code review na branch atual"
- "Revisar código antes do PR"

## Observações

- Nunca faça sugestões se estiver na main.
- Sempre organize as sugestões e TODOs em tópicos claros e objetivos.

## Inputs

- Nenhum argumento obrigatório. O prompt atua no contexto do projeto atual.

## Output

- Alerta se estiver na main.
- Caso contrário, relatório de code review com sugestões e TODOs, apenas para as diferenças da branch atual em relação à main.

## Exemplo de uso

- "Rodar code review na branch atual"
- "Revisar código antes do PR"

## Observações

- Nunca faça sugestões se estiver na main.
- Sempre organize as sugestões em tópicos claros.
