# Testes end-to-end (Playwright)

Rodam o app de verdade no navegador contra o **ambiente de dev** (Clerk Development + Supabase de dev).
Criam usuários de teste, editais, castings e votos — por isso **nunca** apontam para produção.

## Configuração (uma vez)

1. Ambiente de dev funcionando (`.env.local`/`.env` com as chaves de **dev**, migrações aplicadas). Veja `docs/SETUP.md`.
2. Instale o navegador do Playwright:
   ```bash
   yarn playwright install chromium
   ```
3. No mesmo arquivo de ambiente, confirme o banco de dev (trava contra produção):
   ```bash
   E2E_SUPABASE_URL=<mesmo valor de NEXT_PUBLIC_SUPABASE_URL do projeto de DEV>
   ```
   Também são necessárias `SUPABASE_SERVICE_ROLE_KEY` e `CLERK_SECRET_KEY` (de dev) para preparar os dados.
4. Para os uploads (apresentação do intérprete), as variáveis `AWS_*` precisam existir — o envio ao S3 é
   interceptado pelo teste, mas o app ainda assina a URL de upload.

## Rodar

```bash
yarn test:e2e          # sobe o `yarn dev` sozinho (ou reaproveita um já rodando) e roda tudo
yarn test:e2e:ui       # modo interativo, passo a passo
yarn playwright show-report   # relatório da última execução (com vídeo/trace das falhas)
```

Contra um endereço já publicado (ex.: o domínio de dev): `E2E_BASE_URL=https://dev.<dominio> yarn test:e2e`.

## O que acontece

- **Setup** (`global.setup.ts`): confere que é dev, cria no Clerk os usuários de teste (`e2e-*+clerk_test@example.com`,
  sem e-mail real), faz login de cada um (sessões em `e2e/.auth/`, fora do git), zera o estado da última execução
  e prepara os dados: admin, roteiro publicado do autor, onboarding concluído (menos para o "novato").
- **Testes**
  - `onboarding.spec.ts` — primeiro login de um leitor até o feed.
  - `editais.spec.ts` — ciclo completo: cadastro e aprovação do intérprete → edital → inscrição → casting →
    finalista → escolha do elenco → voto pelo link compartilhado (com documento) → vencedor.
  - `publico.spec.ts` — páginas públicas e rotas protegidas para visitante.
- **Teardown** (`global.teardown.ts`): apaga os editais `e2e-*` (e, em cascata, inscrições, castings e votos).

## Contas de teste

| Papel | E-mail |
| :-- | :-- |
| Admin e roteirista | `e2e-admin+clerk_test@example.com` |
| Intérprete | `e2e-interprete+clerk_test@example.com` |
| Eleitor | `e2e-eleitor+clerk_test@example.com` |
| Novato (onboarding) | `e2e-novato+clerk_test@example.com` |

O login nos testes usa o `@clerk/testing` (token de teste + login por ticket): não passa pelo Google nem por captcha.
