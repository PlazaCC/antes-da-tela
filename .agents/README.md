# .agents/README.md

## Diretório Central de Skills e Regras

Este diretório centraliza todas as skills e regras para agentes MCP, Copilot Chat, Claude Code, etc.

### Como adicionar uma nova skill

1. Crie uma subpasta em `.agents/skills/` com o nome da skill (exatamente igual ao campo `name` do frontmatter).
2. Adicione um arquivo `SKILL.md` com frontmatter YAML:
   ```yaml
   ---
   name: minha-skill
   description: Descreva o que a skill faz e quando usar.
   ---
   ```
3. (Opcional) Adicione assets, exemplos ou referências em subpastas.

### Convenções

- Skills: `.agents/skills/<nome-da-skill>/SKILL.md`
- Regras: `.agents/rules/<stack>.md`
- Manifesto: `.agents/skills/skills-manifest.yaml` (gerado automaticamente)

### Como agentes devem consumir

- Configure o agente para ler `.agents/skills/**/SKILL.md`.
- O manifesto facilita parsing rápido, mas não é obrigatório.

---

## Atualização do Manifesto

Execute o script `generate-skills-manifest.ts` para atualizar `skills-manifest.yaml` automaticamente.
