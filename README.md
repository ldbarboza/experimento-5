# experimento-5

CRUD de produtos bancários built with Next.js 14 (App Router, TypeScript) and
ready for zero-config deployment on Vercel.

## Features

The root page (`/`) lists the registered banking products and offers **Novo
Produto**, **Editar** and **Excluir** (with a confirmation dialog) actions. The
UI talks to these Route Handlers:

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/banking-products` | List products, most recently created first |
| `POST` | `/api/banking-products` | Create a product (`201`, or `400` with `{ errors }`) |
| `PUT` | `/api/banking-products/:id` | Update a product (`200`, `400`, or `404`) |
| `DELETE` | `/api/banking-products/:id` | Delete a product (`204` or `404`) |

A product has `id`, `name`, `type` (`CONTA_CORRENTE`, `CONTA_POUPANCA`,
`CARTAO_CREDITO`, `EMPRESTIMO_PESSOAL`, `INVESTIMENTO`), `description`,
`interestRate` (% p.a.), `monthlyFee` (BRL), `isActive` and `createdAt`.

> **Persistence:** products live in a module-level `Map` inside the server
> process (`lib/store.ts`). Data is therefore lost on every server restart, and
> `next dev` also resets it whenever the module is hot-reloaded. Swapping
> `lib/store.ts` for a real database is the only change needed to persist data.

## Requirements

- Node.js >= 20 (matches Vercel's default runtime)

## Local development

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

| Script | Purpose |
| --- | --- |
| `npm run build` | Production build (`next build`) |
| `npm start` | Serve the production build (`next start`) |
| `npm test` | Run the test suite (Vitest) |
| `npm run typecheck` | Type-check without emitting (`tsc --noEmit`) |

## Deploying to Vercel

The project needs no `vercel.json`: Vercel detects Next.js from `package.json`
and `next.config.mjs`, and uses `next build` with the `.next` output directory.

One-time setup in the Vercel dashboard:

1. **Add New… → Project → Import Git Repository** and pick `ldbarboza/experimento-5`.
2. Keep the auto-detected framework preset (**Next.js**) and default build settings.
3. Confirm the production branch is `main` — every push to `main` then triggers an
   automatic production deployment and Vercel issues a public `*.vercel.app` URL.

`package-lock.json` is committed so Vercel installs the exact same dependency
versions as local builds.
