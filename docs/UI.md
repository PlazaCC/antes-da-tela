# shadcn/ui — Customização e Tokens

Este projeto utiliza shadcn/ui como base do design system, com tokens e temas customizados via Tailwind CSS.

## Tokens e Temas

- As cores, espaçamentos e tipografia são definidos em `tailwind.config.ts`.
- Para customizar, edite os tokens em `theme.extend`.
- O padrão segue o design system do shadcn, mas pode ser adaptado conforme identidade visual do produto.

## Tokens e componentes shadcn/ui

- Os tokens de cor, radius, tipografia e espaçamentos estão definidos em `tailwind.config.ts` e `app/globals.css`.
- Todos os componentes shadcn/ui seguem o design system do Figma, com variantes e estados conforme especificação.
- Veja o mapeamento completo em `docs/shadcn-figma-mapping.md`.
- Para exemplos e testes, acesse `/development/components`.

### Exemplos de tokens principais

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;
  --radius: 0.5rem;
  /* ... */
}
```

### Componentes disponíveis

- Button, Card, Input, Badge, Dialog, Tabs, DropdownMenu, Checkbox, Label, Avatar, Progress, Tooltip, Switch, Skeleton, etc.

Todos os componentes são customizados para refletir o design system do Figma.

## Componentes Essenciais

- Button, Card, Badge, Input, DropdownMenu, Dialog já estão instalados em `components/ui/`.
- Para adicionar novos componentes, use:
  ```bash
  yarn dlx shadcn@latest add <componente>
  ```

## Exemplos de Customização

### Alterando Cores

```js
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#1e40af',
        secondary: '#64748b',
        // ...
      },
    },
  },
}
```

### Usando Variantes

```tsx
<Button variant="outline">Outline</Button>
<Button variant="destructive">Destrutivo</Button>
```

## Referências

- [Documentação oficial shadcn/ui](https://ui.shadcn.com/docs)
- [Tokens e temas](https://ui.shadcn.com/docs/theming/tokens)
- [Customização via Tailwind](https://tailwindcss.com/docs/theme)
