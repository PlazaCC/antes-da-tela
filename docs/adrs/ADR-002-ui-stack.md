# ADR-002 — Stack de UI: shadcn/ui + Tailwind CSS v3

| Campo         | Valor                           |
| ------------- | ------------------------------- |
| **Status**    | Aceito                          |
| **Data**      | 14/04/2026                      |
| **Contexto**  | Definição formal da stack de UI |
| **Decisores** | Plaza Creative Collective       |

---

## Contexto

Para garantir consistência visual, acessibilidade e máxima produtividade no desenvolvimento da POC "Antes da Tela", é necessário formalizar a stack de UI adotada.

---

## Decisão

**Aprovada:**

- Todos os novos componentes devem ser baseados em **shadcn/ui**, customizados via **Tailwind CSS v3**.
- Utilizar **Radix UI** como base de acessibilidade quando necessário.
- Evitar dependências em design systems proprietários ou bundles pesados.
- Customizações devem ser feitas preferencialmente via Tailwind e tokens utilitários.

---

## Alternativas consideradas

- Chakra UI: tema pronto, mas menos flexível para customização granular e bundle maior.
- Mantine: componentes modernos e acessíveis, porém ecossistema menor e menos alinhado ao padrão Tailwind.
- Headless UI + Tailwind CSS: apenas primitivas, sem componentes visuais prontos, exigindo mais trabalho manual.

---

## Consequências

- Prototipação e entrega visual aceleradas
- Facilidade de manutenção e evolução do design
- Integração nativa com Next.js, IA e ferramentas modernas
- Acessibilidade garantida via Radix UI
- Flexibilidade máxima para ajustes visuais e de UX

---

## Critério de revisão

Esta ADR deve ser revisada se:

- O projeto exigir design system proprietário
- Mudança significativa no ecossistema de UI React
- Novas demandas de acessibilidade ou branding
