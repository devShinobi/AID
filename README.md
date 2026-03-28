# AID — AI Directory

A community-driven directory for discovering and exploring AI tools. Built as a modern monorepo with a headless CMS backend and an Astro SSR frontend.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP
┌────────────────────────▼────────────────────────────────┐
│              Astro SSR  (packages/web)                  │
│                                                         │
│  ┌─────────────────┐    ┌──────────────────────────┐    │
│  │  Astro Pages    │    │  React Islands           │    │
│  │  (SSR .astro)   │    │  SearchBar, SubmitForm   │    │
│  │                 │    │  (client:visible)        │    │
│  └────────┬────────┘    └──────────────────────────┘    │
│           │ lib/queries/* (Directus SDK)                 │
└───────────┼─────────────────────────────────────────────┘
            │ REST API (port 8055)
┌───────────▼─────────────────────────────────────────────┐
│              Directus 11  (headless CMS)                │
│                                                         │
│  • REST & GraphQL API                                   │
│  • Role-based access control                            │
│  • Admin UI at /admin                                   │
│  • File uploads & media                                 │
└───────────┬─────────────────────────────────────────────┘
            │ TCP (port 5432)
┌───────────▼─────────────────────────────────────────────┐
│              PostgreSQL 16  (database)                  │
└─────────────────────────────────────────────────────────┘
```

### Monorepo layout

```
aid/
├── packages/
│   ├── web/              # Astro 5 SSR frontend (port 4321)
│   │   ├── src/
│   │   │   ├── pages/        # File-based routing
│   │   │   │   ├── index.astro          # Homepage — periodic-table group grid
│   │   │   │   ├── tools/
│   │   │   │   │   ├── index.astro      # Tool listing with filters & search
│   │   │   │   │   └── [slug].astro     # Tool detail page
│   │   │   │   ├── news/index.astro
│   │   │   │   ├── faq.astro
│   │   │   │   └── submit.astro
│   │   │   ├── components/   # Astro + React components
│   │   │   ├── layouts/      # BaseLayout.astro
│   │   │   └── lib/
│   │   │       ├── directus.ts          # Directus client singleton
│   │   │       ├── queries/             # Data-fetching functions
│   │   │       └── utils/               # Formatting, pagination helpers
│   │   └── astro.config.mjs
│   └── shared/           # Shared TypeScript types & validators
│       └── src/types/        # Tool, Group, Review, Award, FAQ, etc.
├── scripts/
│   ├── setup-directus.ts # Creates all Directus collections + permissions
│   └── seed.ts           # Inserts sample data (idempotent)
├── docker/
│   └── docker-compose.yml  # Postgres + Directus containers
├── turbo.json            # Turborepo pipeline
└── pnpm-workspace.yaml
```

### Data model (Directus collections)

| Collection    | Description                                  |
|---------------|----------------------------------------------|
| `tools`       | Core AI tool records                         |
| `groups`      | Tool categories (Writing, Code, etc.)        |
| `tool_groups` | M2M junction — tools ↔ groups               |
| `reviews`     | User and expert reviews per tool             |
| `alternatives`| Alternative tools linked to a tool           |
| `tutorials`   | Links / embeds for tutorials per tool        |
| `awards`      | Award definitions (Editor's Choice, etc.)    |
| `tool_awards` | M2M junction — tools ↔ awards               |
| `faq`         | FAQ entries per tool                         |
| `news`        | News items linked to a tool                  |

### Key design decisions

- **SSR over SSG** — tool data changes frequently; every request fetches fresh data from Directus.
- **No Directus relation traversal for public reads** — M2M filters on public endpoints return 403. All related data is fetched by querying the junction/child collection directly with a `tool_id` filter.
- **React islands** — only interactive components (search bar, submit form) are hydrated client-side; everything else is static HTML.
- **Tailwind v4** — uses the new `@import "tailwindcss"` syntax, no `tailwind.config.js` needed.

---

## Quick start

See [DEVELOPMENT.md](./DEVELOPMENT.md) for full setup instructions.

```bash
cp .env.example .env
docker compose -f docker/docker-compose.yml up -d
pnpm install
pnpm --filter @aid/scripts setup-directus
pnpm --filter @aid/scripts seed
pnpm dev
```

→ Frontend: http://localhost:4321
→ Directus Admin: http://localhost:8055/admin
