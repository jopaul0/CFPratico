# CF Prático – Web

Versão web mínima e funcional do CF Prático, usando **Vite + React 19 + Tailwind v4** e **React Router v7**.

## Scripts
- `npm run dev` — inicia o ambiente de desenvolvimento
- `npm run build` — gera build de produção
- `npm run preview` — pré-visualiza a build

## Dados
Os dados são salvos em **LocalStorage** (chave `cfp_db_v1`). A API de banco foi desenhada para espelhar a do mobile,
facilitando evoluir depois para IndexedDB/Dexie ou API real.

## Rotas
- `/` — Extrato com seleção e exclusão em massa
- `/add` — Adicionar transação
- `/transaction/:id` — Detalhe
- `/settings` — Preferências
- `/admin` — Área administrativa (placeholder)

Gerado em 2025-11-04T20:52:15.579937.