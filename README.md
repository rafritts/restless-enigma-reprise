# Restless Enigma Reprise

A high-end rebuild of [Restless Enigma](https://github.com/rafritts/restless-enigma) — the first app I shipped with an LLM (GPT-4 era). Same core idea: a working **Enigma** machine and a crib-based **Bombe** breaker. New stack, client-side crypto, and a polished modern SaaS UI.

## Stack

| Layer | Choice |
|-------|--------|
| Monorepo | npm workspaces |
| Cipher engine | `@restless/enigma` (TypeScript) |
| Web | Next.js (App Router) + Tailwind CSS v4 |
| Motion | Framer Motion |
| UI primitives | Radix + shadcn-style components |
| Bombe | Web Worker (no server required) |
| Host | Vercel-ready |

## Develop

```bash
npm install
npm run dev        # Next.js on :3000
npm test           # cipher + bombe unit tests
npm run build      # production build
```

## Packages

- `packages/enigma` — pure TS Enigma + Bombe (ported from the original Java, same test vectors)
- `apps/web` — Next.js UI with split-flap displays, rotor dials, plugboard cables, Bombe telemetry

## Demo notes

- Plugboard search is limited to **1 cable** so a full Bombe sweep stays interactive in the browser (same deliberate constraint as the original cloud demo).
- Load a **scenario** on either console for a one-click path through encrypt → break.

## License

Private / personal unless otherwise noted.

## Deploy (Vercel)

Project is linked to Vercel under **rafritts-projects/restless-enigma-reprise**.

- Production: https://restless-enigma-reprise.vercel.app
- Root Directory: `apps/web`
- Install: `cd ../.. && npm install`
- Build: `cd ../.. && npm run build -w @restless/enigma-web`

```bash
npm i -g vercel
vercel login
vercel link          # if needed
vercel --prod        # deploy production
```

GitHub repo is connected — pushes to `main` should trigger production deploys.
