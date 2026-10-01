# Divã

Sistema para consultórios de psicologia: agenda, pacientes, financeiro, prontuário e laudos para a psicóloga, e agendamento, cancelamento e pagamentos para o paciente.

## Rodando localmente

1. Copie `.env.example` para `.env.local` e preencha os segredos (os comandos para gerar estão no próprio arquivo).
2. Suba o Postgres: `docker compose up -d`
3. Instale e aplique as migrações: `pnpm install` e `pnpm db:migrate`
4. Rode o app: `pnpm dev`

As convenções do projeto estão em [CLAUDE.md](CLAUDE.md).
