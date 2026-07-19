# AGENTS.md

## Projeto

Sistema multiempresa para gestão de viagens, escalas, técnicos,
clientes, veículos e pernoites.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase PostgreSQL
- @supabase/ssr
- Zod
- pnpm

## Arquitetura

- Organizar o código por feature.
- Usar Server Components para leituras.
- Usar Server Actions para mutações.
- Usar Route Handlers somente para endpoints HTTP reais.
- Não chamar APIs internas do Next.js com fetch.
- Manter páginas pequenas e focadas em composição.
- Não colocar regras de negócio em componentes visuais.
- Separar actions, application, schemas, types e infraestrutura.
- Usar `import "server-only"` em módulos exclusivamente server-side.
- Não criar BaseService, BaseRepository ou abstrações genéricas prematuras.

## Supabase

- Separar cliente de navegador e cliente de servidor.
- Nunca expor service_role no frontend.
- Não armazenar tokens manualmente em localStorage.
- Usar RLS em todas as tabelas operacionais.
- Toda entidade operacional deve possuir organization_id.
- Nunca confiar apenas no organization_id recebido pela interface.

## Qualidade

- Não usar any.
- Não usar ts-ignore.
- Não desabilitar ESLint para esconder erros.
- Validar entradas com Zod.
- Tratar mensagens de erro em português.
- Não expor erros internos do Supabase ao usuário.
- Não registrar senhas, tokens ou cookies em logs.

## Validação obrigatória

Após alterações relevantes, executar:

```bash
pnpm lint
pnpm exec tsc --noEmit