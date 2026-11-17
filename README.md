# Divã

Sistema para consultórios de psicologia: agenda, pacientes, financeiro, prontuário e laudos para a psicóloga, e agendamento, cancelamento e pagamentos para o paciente.

## Stack

Next.js (App Router) · React · TypeScript · Tailwind · shadcn/ui · TanStack Query e Table · Zod · React Hook Form · Tiptap · React-PDF · Supabase (Postgres, Auth, Storage) · Biome · Vitest. O backend segue os mesmos padrões do Tably.

## Rodando localmente

1. Copie `.env.example` para `.env.local` e preencha com os dados do projeto no Supabase (as instruções estão no próprio arquivo).
2. Instale as dependências: `pnpm install`
3. Aplique as migrações e gere os tipos: `pnpm db:push` e `pnpm db:types`
4. Rode o app: `pnpm dev`

Todos os dados ficam no Supabase, então o app precisa do projeto configurado no `.env.local` para abrir.

## Estrutura

- `src/app`: rotas. `(psychologist)/dashboard` é a área do profissional. Componentes usados por uma única página ficam em `components/` dentro da rota.
- `src/features/<domínio>`: `actions.ts`, `queries.ts`, `schemas.ts`, `types.ts`, `hooks/` e `components/` de cada domínio.
- `src/components`: componentes compartilhados (`ui/` do shadcn, tabela, formulários, diálogos, layout e feedback).
- `src/lib`: utilitários (datas, dinheiro, formatação, rotas, Supabase, variáveis de ambiente).
- `supabase/migrations`: schema do banco, funções e políticas de acesso.

## Comandos

`pnpm dev` · `pnpm lint` · `pnpm format` · `pnpm typecheck` · `pnpm test` · `pnpm build`

As convenções do projeto estão em [CLAUDE.md](CLAUDE.md).
