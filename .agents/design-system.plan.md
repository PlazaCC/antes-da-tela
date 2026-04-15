Com base nos dados extraídos do Figma, aqui está o plano detalhado para configurar o design system do projeto:

## 🎨 Design System Atual vs Figma

### Análise de Cores

**Design System Atual:**

- 8 tokens: primary, background, surface, border, text, brand, state-success, state-warning

**Figma (Foundations):**

- 12 tokens: bg/base, bg/surface, bg/elevated, border/subtle, border/default, text/primary, text/secondary, text/muted, brand/accent, brand/lime, state/error, state/success, state/warning
- Cores adicionais: #0E0E0E, #161616, #1E1E1E, #252525, #343434, #F0EDE6, #B7B4B0, #6B6860, #E85C2F, #C8E87A, #EF4545, #3CBF7E, #F5C126

### Análise de Tipografia

**Design System Atual:**

- 3 fontes: Inter, DM Serif Display, DM Mono
- 4 escalas: display, heading, body, mono

**Figma (Foundations):**

- Mesmas 3 fontes
- 8 escalas: Display/Hero, Display/Hero Italic, Heading/1, Heading/2, Heading/3, Body/Large, Body/Default, Body/Small, Label/Mono Default, Label/Mono Caps, Label/Mono Small
- Tamanhos e pesos específicos para cada escala

### Análise de Componentes

**Design System Atual:**

- 8 componentes: Button, Tag, Input, Card, ReactionBar, StarRating, Navigation

**Figma (Components):**

- 18+ componentes: Button (completo), Tag (completo), Input (completo), ScriptCard, ReactionBar, StarRating, NavBar, Comment, MetricCard, Dropdown, Info, Radio box, Drag, Progress
- Muitos estados e variantes detalhados

## 📋 Plano de Implementação

### Fase 1: Atualização de Foundations

1. **Atualização de Cores**
   - Adicionar novos tokens de cor do Figma
   - Atualizar .agents/design-system.meta.json
   - Atualizar tailwind.config.ts com nova paleta

2. **Atualização de Tipografia**
   - Adicionar novas escalas do Figma
   - Atualizar configurações de font-family e scales

3. **Atualização de Espaçamento e Grid**
   - Validar escala de espaçamento atual
   - Atualizar breakpoints e containers

### Fase 2: Implementação de Componentes

1. **Componentes Existentes**
   - Atualizar Button com todas as variantes do Figma
   - Atualizar Tag com todos os tipos do Figma
   - Atualizar Input com todos os estados do Figma

2. **Novos Componentes**
   - Implementar ScriptCard
   - Implementar NavBar
   - Implementar Comment
   - Implementar MetricCard
   - Implementar Dropdown
   - Implementar Radio box
   - Implementar Drag
   - Implementar Progress

### Fase 3: Guidelines e Documentação

1. **Usage Guidelines**
   - Adicionar guidelines do Figma (espaçamento, boas práticas, grid, layout)
   - Atualizar .agents/design-system.meta.json

2. **Documentação**
   - Criar documentação técnica
   - Preparar exemplos de uso

### Fase 4: Implementação no Projeto

1. **Atualização de Tokens**
   - Atualizar tailwind.config.ts com novas cores
   - Criar CSS variables para novos tokens

2. **Componentes**
   - Implementar/atualizar componentes UI
   - Criar demonstrações na pasta app/development

3. **Demonstrações**
   - Página /development: showcase de todos os componentes
   - Página /development/components: detalhamento de cada componente

### Fase 5: Validação e Deploy

1. **Testes Visuais**
   - Verificar consistência visual
   - Testar responsividade

2. **Documentação Final**
   - Atualizar docs/FIGMA.md
   - Criar guia de contribuição

## 🎯 Entregáveis Esperados

1. **.agents/design-system.meta.json** atualizado com dados do Figma
2. **tailwind.config.ts** com nova paleta de cores
3. **18+ componentes UI** implementados/atualizados
4. **2 páginas de demonstração** em app/development/
5. **Documentação técnica** atualizada

## 🚀 Próximos Passos

Para executar este plano, preciso:

1. Acessar os dados do Figma (requer MCP do Figma conectado)
2. Extrair informações das 3 páginas principais
3. Comparar com estrutura atual
4. Implementar as atualizações
5. Normalizar tokens para HSL no `.agents/design-system.meta.json` (feito)

## ✅ Checklist de implementação

### Foundations

- [x] Garantir meta.json com tokens Figma
- [x] Sincronizar `tailwind.config.ts` com tokens semânticos e cores do Figma
- [x] Adicionar variáveis CSS de design system em `app/globals.css`
- [x] Configurar tema dark padrão no layout e no ThemeProvider
- [x] Revisar escala de tipografia no CSS global e no projeto
- [x] Validar breakpoints e espaçamento com as diretrizes do Figma

### Componentes da UI

- [x] Corrigir `app/development/components/page.tsx`
- [x] Criar `ScriptCard`, `Comment`, `MetricCard`, `RadioBox`, `DragZone`
- [x] Implementar `NavBar` e `Info` em componentes reutilizáveis
- [x] Adicionar variantes adicionais de `Tag` e `Input` conforme Figma

### Demonstração no Development

- [x] Criar rota `app/development/design-system`
- [x] Adicionar link de navegação no layout de desenvolvimento
- [x] Incluir cards de demonstração no overview de `app/development`
- [x] Completar galeria de tokens com exemplos reais de uso
- [x] Adicionar casos de uso de componente/documentação visual no playground

### Documentação / Entregáveis

- [ ] Atualizar `docs/FIGMA.md` com o resumo do sistema de design
- [ ] Consolidar guidelines em `.agents/design-system.meta.json`
- [ ] Publicar guia de contribuição para novo design system
