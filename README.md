# experimento-5

Minimal "Hello World" application built with Next.js 14 (App Router, TypeScript)
and ready for zero-config deployment on Vercel.

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
