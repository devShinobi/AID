# Developer Setup Guide

Everything a new developer needs to get AID running locally from scratch.

---

## Prerequisites

Make sure the following are installed before you begin:

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 20 | https://nodejs.org |
| pnpm | ≥ 9 | `npm install -g pnpm` |
| Docker Desktop | latest | https://www.docker.com/products/docker-desktop |
| Git | any | https://git-scm.com |

---

## 1. Clone the repo

```bash
git clone https://github.com/devShinobi/AID.git
cd AID
```

---

## 2. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and review the defaults. For local development the defaults work as-is:

```env
# Directus admin credentials
DIRECTUS_ADMIN_EMAIL=admin@example.com
DIRECTUS_ADMIN_PASSWORD=admin123

# Database (matches docker-compose defaults)
DB_DATABASE=aid
DB_USER=aid_user
DB_PASSWORD=aid_password

# Directus secret — change this in production
DIRECTUS_SECRET=changeme-use-strong-secret-in-prod

# CORS — must match the Astro dev server port
CORS_ORIGIN=http://localhost:4321
```

---

## 3. Start the backend services

```bash
docker compose -f docker/docker-compose.yml up -d
```

This starts two containers:
- **`aid_postgres`** — PostgreSQL 16 on port `5432`
- **`aid_directus`** — Directus 11 on port `8055`

Wait about 20–30 seconds for Directus to finish initialising. You can watch progress with:

```bash
docker compose -f docker/docker-compose.yml logs -f directus
```

Directus is ready when you see `Server started at http://0.0.0.0:8055`.

---

## 4. Install dependencies

```bash
pnpm install
```

This installs all workspace packages (`packages/web`, `packages/shared`, `scripts`) in one go.

---

## 5. Set up the Directus schema

This script creates all collections, fields, relations, and public read permissions in Directus:

```bash
pnpm --filter @aid/scripts setup-directus
```

You only need to run this **once** per fresh database. If you re-run it on an existing database it will skip collections that already exist.

---

## 6. Seed sample data

```bash
pnpm --filter @aid/scripts seed
```

This inserts:
- 5 groups (Writing, Image Generation, Code, Productivity, Chat & Assistants)
- 6 tools (ChatGPT, Claude, Midjourney, GitHub Copilot, Stable Diffusion, Notion AI)
- News, reviews, alternatives, tutorials, FAQs, and awards for each tool

The seed script is **idempotent** — safe to re-run. It skips any collection that already has data.

---

## 7. Start the frontend

```bash
pnpm dev
```

This starts the Astro dev server via Turborepo.

| URL | Service |
|-----|---------|
| http://localhost:4321 | AID frontend |
| http://localhost:8055/admin | Directus admin UI |

Log in to the admin UI with the credentials from your `.env` (`admin@example.com` / `admin123`).

---

## Project commands

All commands run from the repo root unless noted.

```bash
# Start all dev servers
pnpm dev

# Build all packages
pnpm build

# Type-check all packages
pnpm typecheck

# Format all files (Prettier)
pnpm format

# Run unit tests
pnpm test

# Run e2e tests (Playwright)
pnpm test:e2e

# Re-run only the Directus setup script
pnpm --filter @aid/scripts setup-directus

# Re-run only the seed script
pnpm --filter @aid/scripts seed

# View backend logs
docker compose -f docker/docker-compose.yml logs -f

# Stop backend containers
docker compose -f docker/docker-compose.yml down

# Wipe the database and start fresh
docker compose -f docker/docker-compose.yml down -v
```

---

## Adding a new tool (via admin UI)

1. Go to http://localhost:8055/admin → **Tools** collection
2. Click **+ Create Item**
3. Fill in name, slug, overview, pricing, pros/cons
4. Set `status` to `published`
5. Go to **Tool Groups** collection and create junction records to assign groups
6. The frontend picks up changes immediately (SSR — no rebuild needed)

---

## Adding a new tool (programmatically)

Add a new entry to the `toolDefs` array in `scripts/seed.ts` following the existing pattern, then run:

```bash
pnpm --filter @aid/scripts seed
```

---

## Common issues

### Directus is not responding
Make sure Docker Desktop is running and the containers are up:
```bash
docker compose -f docker/docker-compose.yml ps
```

### Seed fails with "Invalid payload. email must be a valid email."
The `DIRECTUS_ADMIN_EMAIL` env var is not set or is using the old default (`admin@aid.local`).
Make sure your `.env` has `DIRECTUS_ADMIN_EMAIL=admin@example.com`.

### Frontend shows no tools
The Directus public read policy may be missing. Re-run the setup script:
```bash
pnpm --filter @aid/scripts setup-directus
```
Then re-run seed if needed.

### Port conflicts
If ports `4321`, `8055`, or `5432` are already in use, stop the conflicting process or change the ports in `.env` and `docker/docker-compose.yml`.

---

## Environment variables reference

| Variable | Default | Description |
|----------|---------|-------------|
| `DIRECTUS_URL` | `http://localhost:8055` | Directus API base URL (used by Astro) |
| `DIRECTUS_ADMIN_EMAIL` | `admin@example.com` | Directus admin login email |
| `DIRECTUS_ADMIN_PASSWORD` | `admin123` | Directus admin login password |
| `DIRECTUS_SECRET` | `changeme-...` | JWT secret — **change in production** |
| `DB_DATABASE` | `aid` | PostgreSQL database name |
| `DB_USER` | `aid_user` | PostgreSQL user |
| `DB_PASSWORD` | `aid_password` | PostgreSQL password |
| `CORS_ORIGIN` | `http://localhost:4321` | Allowed CORS origin for Directus |
