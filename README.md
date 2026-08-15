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

## Getting started

```bash
npm install
npm run dev      # starts web + api (and package watch builds via turbo)
```

Other root scripts: `npm run build`, `npm run lint`, `npm run check-types`.

### Environment

**API** (`apps/api`):

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP listen port |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017` | Mongo connection string |
| `MONGODB_DB` | `dynamicForms` | Database name |
| `CORS_ORIGIN` | (all) | Comma-separated allowed origins |

**Web** (`apps/web`): set the tRPC API base URL via the app’s env (see `apps/web/.env`).

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
