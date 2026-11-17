@AGENTS.md

# Divã — convenções do projeto

Sistema para consultórios de psicologia. O primeiro lançamento tem só a área da psicóloga (agenda, pacientes, financeiro, prontuário e laudos), com cadastro e login por email e senha ou Google. A área do paciente fica para depois.
Stack: Next.js (App Router) · React · TypeScript · Tailwind · shadcn/ui (Base UI) · Zod · React Hook Form · TanStack Query · TanStack Table · Supabase (Postgres, Auth, Storage) · date-fns · nuqs · Sonner · Biome · Vitest · react-number-format · Tiptap (texto formatado) · React-PDF.

## Comunicação
- Responder sempre em português brasileiro, explicando decisões técnicas e trade-offs.
- Textos da interface com linguagem neutra de gênero: o profissional pode ser homem ou mulher (ex.: "Acesse sua conta", "pelo consultório", nunca "Bem-vinda" ou "a psicóloga").

## Código
- Nunca escrever comentários no código (diretivas de ferramenta, como `biome-ignore`, são a exceção).
- Código limpo, conciso, SOLID, DRY: extrair funções/componentes reutilizáveis quando houver repetição.
- Sempre TypeScript. Nunca `any`. Preferir `type` a `interface`. Tipagem explícita.
- Todo o código em inglês: variáveis, funções, componentes, arquivos, pastas, rotas (URLs), tabelas, colunas e valores de enum. Só o texto exibido ao usuário fica em português.
- Nomes descritivos (`isLoading`, `hasError`). Arquivos e pastas em kebab-case.
- `as const` para arrays/objetos imutáveis, branded types para IDs, discriminated unions para estados complexos, `?.` e `??` quando apropriado, utility types (`Pick`, `Omit`, `Partial`).
- Atualização de estado que depende do anterior: sempre na forma de callback.

## Arquitetura
- Organização por domínio em `src/features/<domain>/`: `actions.ts`, `schemas.ts`, `types.ts`, `hooks/` e `components/`.
- Backend segue as mesmas tecnologias e padrões do Tably: Supabase com o cliente de `src/lib/supabase/server.ts`, regras de negócio e transações em funções RPC do Postgres, RLS em todas as tabelas e um `messages.ts` por domínio traduzindo os códigos de erro do banco.
- Acesso ao banco só no servidor: `queries.ts` de cada domínio (com `import "server-only"`) e Server Actions. Server Actions validam a entrada com Zod, checam permissão e delegam; nunca confiam em dados do cliente.
- Server Actions retornam `ActionResult` (`src/lib/action-result.ts`) e nunca lançam erro para o cliente. Os hooks usam `unwrapActionResult`.
- Permissão checada em toda Server Action e consulta (`requirePsychologist` em `src/features/auth/queries.ts`). O `src/proxy.ts` só faz redirecionamento otimista para o login.
- Schemas Zod são a fonte única de verdade: tipos vêm de `z.infer` e o mesmo schema valida formulário e servidor.
- Variáveis de ambiente só via `env` (`src/lib/env.ts`), validadas com Zod.

## Backend no Supabase
- Todos os dados vêm do Supabase pelas funções de `src/features/<domain>/queries.ts`, com RLS separando os dados de cada profissional. Não existem dados de exemplo nem modo de teste.
- Regras e transações no banco: criar uma sessão gera o pagamento (gatilho), cancelar deixa o pagamento sem cobrança e reagendar ou mudar a forma de pagamento recalcula o vencimento (`payment_due_date`). Criar sessões, cancelar, excluir paciente e registrar ou desfazer pagamento são funções RPC.
- Sessões que já terminaram viram realizadas pela RPC `complete_finished_appointments`, chamada antes das leituras da agenda e dos pacientes.
- Anexos de despesas ficam no bucket privado `expense-attachments`, no caminho `<psychologist_id>/<expense_id>/<attachment_id>`.
- Autenticação pelo Supabase Auth: login, cadastro, Google, esqueci a senha e nova senha em `src/app/(auth)`, com o callback em `src/app/auth/callback`.

## Dados
- Dinheiro sempre em centavos inteiros (`Cents`, `src/lib/money.ts`), nunca `float`. Conversão só na borda (input e `formatCurrency`).
- Datas salvas em UTC (`timestamptz`) e exibidas em `America/Sao_Paulo` pelas funções de `src/lib/format.ts`.
- Conflito de horário bloqueado no banco pela restrição `appointments_no_overlap`; a interface só antecipa o erro.
- Tabelas com paginação, ordenação e filtros no servidor (TanStack Table em modo manual) e índices nas colunas filtradas.
- Webhooks de pagamento idempotentes via `processed_webhook_events`.
- Prontuário e laudos: conteúdo criptografado (`src/features/clinical-records/content-encryption.ts`), exclusão lógica (`deleted_at`) e auditoria de leitura/escrita (`recordAuditLog`).
- Mudanças no schema: nova migração SQL em `supabase/migrations/`, depois `pnpm db:push` e `pnpm db:types`; nunca editar migrações já aplicadas.

## React e Next.js
- Componentes como `function MeuComponente()`, nunca arrow function atribuída a const.
- Usar componentes do shadcn/ui ao máximo.
- Server Components por padrão; `"use client"` só onde há interação.
- Formulários: sempre React Hook Form + Zod via `zodResolver`, com feedback visual claro.
- Client Components falam com Server Actions via TanStack Query, sempre por hooks customizados (um por query/mutation). Cada hook exporta uma função que retorna a query key ou a mutation key.
- Inputs com máscara: sempre `react-number-format`.
- Datas e horários: sempre `DateField` e `TimeField` (`src/components/form`), nunca `<input type="date|time">` nativo.
- Inputs nunca começam com valor preenchido (como "0" ou "R$ 0,00"): começam vazios, só com placeholder. Campos numéricos opcionais viram 0 no servidor.
- Componente usado por uma única página fica em `components/` dentro da pasta da rota. Componentes compartilhados ficam em `src/components` ou `src/features/<domínio>/components`.
- Sempre `Link` e `Image` do Next. `React.memo`, `useMemo`, `useCallback` e lazy loading com critério.
- Estado no componente mais baixo possível; TanStack Query para dados do servidor; nuqs para filtros e abas que devem ficar na URL.
- `loading.tsx`, `error.tsx` e `not-found.tsx` em cada grupo de rotas.
- Acessibilidade: HTML semântico e atributos `aria-*`/`alt`.

## Estilo
- Não alterar nem adicionar estilização sem pedido explícito.
- Tailwind primeiro, cores via variáveis CSS do tema, variantes com `cva`/`cn`.
- Visual minimalista em roxo claro: cores em `src/app/globals.css` (primária `#6d5bd0`, superfícies lilás bem claras); status com `primary` (confirmada), `success` (realizada/paga), `warning` (a confirmar/pendente) e `destructive` (falta/cancelada). Fonte Poppins em tudo (`font-sans` e `font-heading`), títulos em `font-semibold`.
- Todo elemento clicável usa `cursor-pointer` (regra global em `globals.css`; não sobrescrever com `cursor-default`).
- Valores em dinheiro usam só `$` (ex.: `$ 18,00`), via `formatCurrency`/`CURRENCY_SYMBOL` de `src/lib/format.ts`.
- Barras de rolagem ficam ocultas no app todo (regra global em `globals.css`); a rolagem continua funcionando.
- Todas as telas são responsivas (celular, tablet, notebook e desktop).
- Preferir a escala do Tailwind (`text-sm`, `w-64`, `h-10`, `gap-3`). Valor arbitrário só quando nenhum da escala servir, e aí em `rem` (ex.: `w-[22rem]`), nunca em `px`.
- Telefones cadastrados (pacientes, contatos de emergência e outros) aparecem sempre como link do WhatsApp, pelo componente `WhatsAppLink` (`src/components/whatsapp-link.tsx`).

## Qualidade
- TypeScript estrito com `noUncheckedIndexedAccess`.
- Testes com Vitest ao lado do arquivo (`*.test.ts`) para schemas, regras de negócio e utilitários.
- Antes de commitar: `pnpm lint`, `pnpm typecheck` e `pnpm test`. A CI roda os três e o build.

## Git
- Commits pequenos e focados com Conventional Commits, em branches `feature/`, `fix/` ou `chore/`. O commitlint e o lint-staged rodam pelos hooks do Husky.

## Comandos
- `pnpm db:push` (aplica as migrações no Supabase) · `pnpm db:types` (gera `src/lib/supabase/database.types.ts`)
- `pnpm dev` · `pnpm lint` · `pnpm format` · `pnpm typecheck` · `pnpm test` · `pnpm build`
