# RFC-007 — Pagamento da live e da gravação (Fase 6 do RFC-006)

| Campo  | Valor |
| :----- | :---- |
| Status | Rascunho — decisões de negócio pendentes; nada implementado além dos links externos |
| Data   | 2026-10-29 |
| Escopo | Ingresso da live do roteiro vencedor, acesso pago à gravação, repasse ao elenco |

## Contexto

O RFC-006 prevê, para o roteiro vencedor de cada edital, uma **live de interpretação com custo simbólico** (ex.: R$ 1,99), com **X% repassado aos intérpretes**, e a **gravação disponível na plataforma pela mesma taxa**.

## O que já existe (Fase 5)

O admin cadastra na tela de resultado (A5): data da live, link da transmissão, link do ingresso, preço, % do elenco e link da gravação. A página do edital (E10) mostra esses dados e manda o usuário para os links **externos**. Não há cobrança dentro da plataforma.

## Opções para a cobrança

| Opção | Prós | Contras |
| :---- | :--- | :------ |
| A. Ingresso externo (Sympla, Even3, Hotmart…) — **atual** | Zero desenvolvimento; a plataforma emite nota e cuida do repasse | Taxa da plataforma alta para R$ 1,99; usuário sai do site; sem controle de acesso à gravação |
| B. Mercado Pago (Checkout Pro / Pix) | Pix nativo, taxas menores, split de pagamento ("marketplace") | Integração + webhooks; cadastro de cada intérprete como recebedor para o split |
| C. Stripe (Checkout + Connect) | API madura, Connect resolve o repasse | Pix no Brasil com restrições; cada intérprete precisa de conta Connect |
| D. Pix direto (QR estático + conferência manual) | Simples | Não escala; conciliação manual; sem controle de acesso automático |

## Decisões necessárias

1. Provedor (A, B, C ou D).
2. Quem emite a nota fiscal e como o repasse é tributado.
3. Como o elenco recebe: split automático (exige conta de cada intérprete no provedor) ou repasse manual pela equipe.
4. Controle de acesso à gravação: link aberto, link com senha ou player na plataforma liberado após o pagamento.
5. Hospedagem da gravação (YouTube não listado, Vimeo, S3 + player próprio).

## Esboço técnico (se B ou C)

- Tabela `call_purchases` (user, call, tipo `live|recording`, valor, status, id do provedor).
- Rota de checkout (server) + webhook de confirmação (`app/api/webhooks/<provedor>`).
- Liberação da gravação/live na página E10 conforme a compra.
- Relatório de repasse por edital no admin.
