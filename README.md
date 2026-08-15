# Dynamic Forms

Monorepo for building, previewing, and persisting schema-driven forms.

## Stack

| Area | Tech |
|------|------|
| Monorepo | npm workspaces + Turborepo |
| Web | React 19, Vite, TanStack Router/Query, tRPC client, RJSF + shadcn, Tailwind CSS 4 |
| API | Fastify, tRPC, MongoDB |
| Shared | `@repo/server` (tRPC router + Zod schemas), `@repo/form-tools` (RJSF schema builders) |

## Workspace layout

```
apps/
  web/          # Frontend SPA
  api/          # Fastify + tRPC HTTP server
packages/
  server/       # Shared AppRouter, Zod schemas, procedure definitions
  form-tools/   # JSON Schema / RJSF helpers (base + textbox fields)
```

## Local setup

### Prerequisites

- **Node.js** with **npm ≥ 11.6** (see root `package.json` `packageManager`)
- **MongoDB** running locally (or a remote URI you can reach)

### 1. Install dependencies

From the repo root:

```bash
npm install
```

### 2. Configure environment

**Web** — create `apps/web/.env`:

```bash
VITE_API_URL=http://localhost:3000
```

`VITE_API_URL` is the API origin (no trailing slash). The client calls `${VITE_API_URL}/trpc`.

**API** — optional. Defaults work for a local MongoDB with no auth. To override, export env vars when starting the API (or use your process manager):

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP listen port |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017` | Mongo connection string |
| `MONGODB_DB` | `dynamicForms` | Database name |
| `CORS_ORIGIN` | allow all | Comma-separated allowed origins (e.g. `http://localhost:5173`) |

Example:

```bash
export MONGODB_URI="mongodb://127.0.0.1:27017"
export MONGODB_DB="dynamicForms"
export CORS_ORIGIN="http://localhost:5173"
export PORT=3000
```

### 3. Start MongoDB

Ensure MongoDB is listening on the URI above (default `127.0.0.1:27017`). The API connects on boot and will exit if it cannot reach the database.

### 4. Run the app

From the repo root:

```bash
npm run dev
```

Turborepo starts workspace `dev` tasks (API with `tsx watch`, web with Vite, and package `tsc --watch` builds).

| App | URL |
|-----|-----|
| Web | http://localhost:5173 (Vite default) |
| API | http://localhost:3000 |
| tRPC | http://localhost:3000/trpc |
| Health | http://localhost:3000/health |

Open the web URL in a browser. Create a form on `/create`; it should persist via the API and appear on `/`.

### 5. Run apps individually (optional)

```bash
# terminal 1 — shared packages (if not using root turbo dev)
npm run dev -w @repo/server
npm run dev -w @repo/form-tools

# terminal 2 — API
npm run dev -w @repo/api

# terminal 3 — web
npm run dev -w @repo/web
```

### Other scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Build all packages and apps |
| `npm run lint` | Lint workspaces |
| `npm run check-types` | Typecheck all workspaces |
| `npm run dev -w @repo/api` | API only |
| `npm run dev -w @repo/web` | Web only |

### Production-style run

```bash
npm run build
npm run start -w @repo/api   # serves apps/api/dist
npm run preview -w @repo/web # Vite preview of apps/web/dist
```

Ensure `VITE_API_URL` pointed at the real API **before** `npm run build` for the web app (Vite inlines it at build time).

---

## Frontend features (`apps/web`)

### Routes

| Path | Purpose |
|------|---------|
| `/` | Landing: list saved forms; create / edit / preview / delete |
| `/create` | Split-pane builder with live preview; save creates a form |
| `/edit/$id` | Same builder prefilled from API; save updates the form |
| `/preview/$id` | Read-only rendered form for a saved definition |

### Form builder UX

- **Live dual-pane editor** (`FormLiveViewer`): left pane designs the form definition; right pane shows a read-only preview that updates on every change.
- **Definition form** (`CommonForm`): RJSF + shadcn UI driven by a create/edit schema (title + list of inputs with title, optional description, optional required).
- **Rendered form** (`ViewForm`): builds an RJSF schema from the definition via `@repo/form-tools` (`buildBaseSchema` + `buildTextBoxSchema` per input) and renders it read-only in preview modes.
- **List management**: home page loads forms via route loader, shows input counts, and supports edit, preview, and delete (delete invalidates the router cache).

### Client architecture

- **TanStack Router** file routes with loaders for `form.list` / `form.byId`, pending and error UI on data routes.
- **tRPC + React Query**: typed client (`@repo/server` `AppRouter`); mutations for create/update/delete; queries in loaders and hooks.
- **UI**: shadcn-style components (button, card, badge, input, etc.), Lucide icons, Geist font, Tailwind.

### Shared form tooling used by the UI

`@repo/form-tools` powers preview rendering:

- `buildSchema` — attaches AJV8 validator and optional UI schema / form data
- `buildBaseSchema` — object schema with title
- `buildTextBoxSchema` — string fields with description, required, and `minLength` when required

---

## Backend features

### HTTP API (`apps/api`)

- **Fastify** server with request logging, graceful shutdown (`SIGINT` / `SIGTERM`), and Mongo connect on boot.
- **CORS** configurable via `CORS_ORIGIN`.
- **Health**: `GET /` → `{ hello: "world" }`, `GET /health` → `{ ok: true }`.
- **tRPC** mounted at `/trpc` with shared `appRouter` and request context that injects the Mongo `Db`.

### tRPC API (`packages/server`)

Namespace: `form.*`

| Procedure | Type | Description |
|-----------|------|-------------|
| `form.list` | query | All forms, newest `createdAt` first |
| `form.byId` | query | Single form by id (`NOT_FOUND` / invalid id → `BAD_REQUEST`) |
| `form.create` | mutation | Insert form; sets `createdAt` / `updatedAt` |
| `form.update` | mutation | Replace title + inputs; bumps `updatedAt` |
| `form.delete` | mutation | Delete by id; returns `{ id }` |

### Data model & validation

Zod schemas (shared with the client via the package):

- **Form input field**: `title` (required), `description?`, `isRequired?`
- **Form payload**: `title` + `inputs` (min 1 field)
- **Persisted form**: payload + `id`, `createdAt`, `updatedAt` (ISO strings on the wire)

MongoDB collection: `forms`. Documents store `ObjectId` `_id` and `Date` timestamps; the router serializes to string `id` and ISO date strings.

### Persistence (`apps/api`)

- MongoDB driver connection pool helpers: `connectDb`, `getDb`, `closeDb`.
- Context wires `db` into every tRPC procedure.

---

## Feature map (end-to-end)

```
Create/Edit UI  →  form.create / form.update  →  MongoDB forms
Home list       →  form.list / form.delete
Preview         →  form.byId  →  ViewForm (RJSF from form-tools)
```
