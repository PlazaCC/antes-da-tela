# Testes end-to-end (Playwright)

Rodam o app de verdade no navegador contra o **ambiente de dev** (Clerk Development + Supabase de dev).
Criam usuários de teste, editais, castings e votos — por isso **nunca** apontam para produção.

## Configuração (uma vez)

1. Ambiente de dev funcionando (`.env.local`/`.env` com as chaves de **dev**, migrações aplicadas). Veja `docs/SETUP.md`.
2. Instale o navegador do Playwright:
   ```bash
   yarn playwright install chromium
   ```
3. Crie o arquivo dos testes a partir do modelo (ele é ignorado pelo git):
   ```bash
   cp .env.e2e.example .env.e2e
   ```
   Preencha ao menos `E2E_SUPABASE_URL` = mesmo valor de `NEXT_PUBLIC_SUPABASE_URL` do projeto de **dev**
   (trava contra produção). As variáveis do app (`SUPABASE_SERVICE_ROLE_KEY`, `CLERK_SECRET_KEY` de dev etc.)
   continuam vindo do `.env.local` / `.env`.
4. Para os uploads (apresentação do intérprete), as variáveis `AWS_*` precisam existir — o envio ao S3 é
   interceptado pelo teste, mas o app ainda assina a URL de upload.

5. Opcional — no `.env.e2e`, as chaves que confirmam do lado de cada serviço (`E2E_SENTRY_API_TOKEN`,
   `SENTRY_ORG`, `SENTRY_PROJECT`, `E2E_RESEND_API_KEY`). Sem elas, os testes de integração confirmam que o app
   enviou e o serviço aceitou; com elas, também que o evento apareceu no Sentry e que o e-mail foi entregue.

E-mails: os testes só enviam para os endereços de teste do Resend (`delivered@resend.dev`, e o intérprete de teste
recebe em `delivered+e2e-interprete@resend.dev`), que simulam entrega sem tráfego real.

## Rodar

```bash
yarn test:e2e          # sobe o `yarn dev` sozinho (ou reaproveita um já rodando) e roda tudo
yarn test:e2e:ui       # modo interativo, passo a passo
yarn playwright show-report   # relatório da última execução (com vídeo/trace das falhas)
```

Contra um endereço já publicado (ex.: o domínio de dev): `E2E_BASE_URL=https://dev.<dominio> yarn test:e2e`.
Se o `.env.e2e` tiver `E2E_BASE_URL` preenchido e você quiser rodar local, deixe a linha vazia (`E2E_BASE_URL=`) —
o domínio de dev só tem o código já mergeado na `dev`.

**Uma execução por vez.** O setup e o teardown apagam todos os editais `e2e-*` e reiniciam as contas de teste, e todas
as execuções usam o mesmo banco de dev e as mesmas contas. Duas ao mesmo tempo (`yarn test:e2e` com o modo `--ui`
aberto, ou duas máquinas) apagam os dados uma da outra no meio do ciclo — os sintomas são 404 na página do edital ou
"inscrições encerradas" sem as inscrições do autor.

Depois de mudar o `.env`, reinicie o `yarn dev`: o Sentry do servidor é iniciado uma vez, na subida (sem isso o teste
"Sentry recebe erro do servidor" avisa que o servidor iniciou sem DSN). Os relatórios ficam em `test-results/`; se o
OneDrive estiver sincronizando a pasta e aparecer `ENOENT`, use `--output` apontando para fora dela.

## O que acontece

- **Setup** (`global.setup.ts`): confere que é dev, cria no Clerk os usuários de teste (`e2e-*+clerk_test@example.com`,
  sem e-mail real), faz login de cada um (sessões em `e2e/.auth/`, fora do git), zera o estado da última execução
  e prepara os dados: admin, roteiro publicado do autor, onboarding concluído (menos para o "novato").
- **Testes**
  - `onboarding.spec.ts` — primeiro login de um leitor até o feed.
  - `editais.spec.ts` — ciclo completo: cadastro e aprovação do intérprete → edital → inscrição → casting →
    finalista → escolha do elenco → voto pelo link compartilhado (com documento) → vencedor.
  - `publico.spec.ts` — páginas públicas e rotas protegidas para visitante.
  - `integrations.spec.ts` — serviços externos do ambiente: erro do navegador e do servidor chegando ao **Sentry**,
    eventos chegando ao **PostHog**, e-mail aceito (e, opcionalmente, entregue) pelo **Resend**. Cada teste é pulado,
    com o motivo, quando o serviço não está configurado.
- **Teardown** (`global.teardown.ts`): apaga os editais `e2e-*` (e, em cascata, inscrições, castings e votos).

## Contas de teste

| Papel | E-mail |
| :-- | :-- |
| Admin e roteirista | `e2e-admin+clerk_test@example.com` |
| Intérprete | `e2e-interprete+clerk_test@example.com` |
| Eleitor | `e2e-eleitor+clerk_test@example.com` |
| Novato (onboarding) | `e2e-novato+clerk_test@example.com` |

O login nos testes usa o `@clerk/testing` (token de teste + login por ticket): não passa pelo Google nem por captcha.
