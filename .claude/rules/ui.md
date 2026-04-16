---
name: ui
description: Regras e convenções para trabalhar com shadcn/ui e Tailwind neste projeto.
---

# UI Rules — shadcn + Tailwind

Este arquivo define regras de uso para componentes de UI gerados pelo `shadcn` e boas práticas relacionadas.

- Regra principal: sempre instale componentes do `shadcn` usando o comando oficial da ferramenta. Use o comando abaixo para adicionar componentes ao projeto:

```bash
yarn dlx shadcn@latest add <component>
```

- Racional: o CLI do `shadcn` gera os arquivos, placeholders e integra os estilos corretamente. Instalar manualmente ou copiar arquivos pode levar a inconsistências e quebrar atualizações futuras.

- Nunca edite manualmente arquivos em `components/ui/` que foram gerados pelo `shadcn` sem antes executar o processo de upgrade/instalação correto.

- Quando for necessário compor ou adaptar um componente para a aplicação, crie um wrapper em `components/<component>/` e mantenha o código gerado intacto. Sempre:
  - aceite e encaminhe a prop `className`;
  - use `cn()` de `@/lib/utils` para mesclar classes;
  - documente o wrapper e explique porque a composição foi necessária.

- Para alterações estruturais (mudanças que exigem alteração de primitives), prefira submeter um PR com a justificativa e os passos para reproduzir a alteração localmente usando o CLI oficial.

- Exemplos rápidos:
  - Adicionar um `dialog`:

    ```bash
    yarn dlx shadcn@latest add dialog
    ```

  - Criar wrapper: `components/confirm-dialog/confirm-dialog.tsx` que usa `components/ui/dialog` internamente e expõe API específica da aplicação.

Seguindo esta regra mantemos consistência com o ecossistema `shadcn` e reduzimos riscos ao atualizar a biblioteca ou regenerar componentes.
