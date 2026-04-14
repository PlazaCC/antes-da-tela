# RFC-004 — Stack de UI: shadcn/ui + Tailwind CSS v3

| Campo                  | Valor                                                        |
| ---------------------- | ------------------------------------------------------------ |
| **Tipo**               | RFC — Request for Comments                                   |
| **Status**             | Aberto                                                       |
| **Data**               | 14/04/2026                                                   |
| **Autor**              | Plaza Creative Collective                                    |
| **Decisão resultante** | Definição formal da stack de UI: shadcn/ui + Tailwind CSS v3 |

---

## Problema

A POC "Antes da Tela" precisa de uma stack de UI consistente, moderna e produtiva, que permita prototipação rápida, customização visual e integração eficiente com IA e padrões de acessibilidade.

---

## Restrições

- Time pequeno, foco em entrega rápida
- Preferência por componentes acessíveis e customizáveis
- Integração nativa com Next.js e Tailwind CSS
- Facilidade de sobrescrever estilos e tokens via IA
- Evitar lock-in em design systems proprietários

---

## Opções consideradas

### Opção A — shadcn/ui + Tailwind CSS v3

- Componentes acessíveis, prontos para produção, baseados em Radix UI
- Customização total via Tailwind CSS v3
- Instalação incremental, sem lock-in
- Ecossistema ativo, documentação clara
- Alinhado com padrões modernos de design e Next.js

### Opção B — Chakra UI

- Componentes acessíveis e tema pronto
- Menos flexível para customização granular
- Bundle maior

### Opção C — Mantine

- Componentes modernos, acessíveis e com tema pronto
- Customização razoável, mas menos flexível que shadcn/ui
- Ecossistema menor e menos alinhado ao padrão Tailwind

### Opção D — Headless UI + Tailwind CSS

- Apenas primitivas, sem componentes visuais prontos
- Mais trabalho manual para montar flows completos

---

## Decisão

**Aprovada:** Opção A — shadcn/ui + Tailwind CSS v3

- Todos os novos componentes devem ser baseados em shadcn/ui, customizados via Tailwind CSS v3.
- Utilizar Radix UI como base de acessibilidade quando necessário.
- Evitar dependências em design systems proprietários ou bundles pesados.
- Customizações devem ser feitas preferencialmente via Tailwind e tokens utilitários.

---

## Consequências

- Prototipação e entrega visual aceleradas
- Facilidade de manutenção e evolução do design
- Integração nativa com Next.js, IA e ferramentas modernas
- Acessibilidade garantida via Radix UI
- Flexibilidade máxima para ajustes visuais e de UX

---

## Critério de revisão

Esta RFC deve ser revisada se:

- O projeto exigir design system proprietário
- Mudança significativa no ecossistema de UI React
- Novas demandas de acessibilidade ou branding
