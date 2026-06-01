# Conexão Brigada — Backend

REST API for [Conexão Brigada](https://github.com/AugustoMittmann/-Front-CSR-Fire-Brigades), a Brazilian volunteer fire brigades platform.

**Stack:** Node 20 · TypeScript (ESM) · Express 4 · Supabase (PostgreSQL) · Auth0 (RS256 JWT) · zod · pino.

---

## Quick start

```bash
nvm use                # picks Node 20 via .nvmrc
cp .env.example .env   # then fill in real values (see below)
npm install
# Run the SQL DDL from "Supabase setup" below in the Supabase SQL editor.
# Create an Auth0 API to obtain AUTH0_AUDIENCE (see "Auth0 setup" below).
npm run dev            # http://localhost:4000
```

Other scripts:

```bash
npm run typecheck      # tsc --noEmit
npm run build          # compile to dist/
npm start              # run the compiled build
```

---

## Environment

All variables are validated at boot via `zod` (`src/config/env.ts`). Missing or malformed values cause an immediate exit — no runtime surprises.

| Variable | Required | Notes |
|---|---|---|
| `PORT` | no (default 4000) | TCP port |
| `NODE_ENV` | no (default development) | `development` \| `production` \| `test` |
| `LOG_LEVEL` | no (default info) | pino level |
| `SUPABASE_URL` | **yes** | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | **yes** | Server-only. **Never** ship to the frontend. |
| `AUTH0_DOMAIN` | **yes** | e.g. `dev-xxxx.us.auth0.com` |
| `AUTH0_AUDIENCE` | **yes** | The Auth0 API "Identifier" (see below) |
| `FRONTEND_ORIGIN_DEV` | no | e.g. `http://localhost:3000` |
| `FRONTEND_ORIGIN_PROD` | no | Production frontend URL |
| `TRUST_PROXY` | no (default `0`) | Set to `1` (or a CIDR) when running behind a proxy/LB so `req.ip` is taken from `X-Forwarded-For` |

`.env` and `.env.*` are gitignored. Only `.env.example` is committed.

---

## Supabase setup

Open the **SQL editor** in your Supabase project and paste the DDL below. The backend uses the **service role key**, which bypasses Row Level Security — all access is mediated by this API. RLS can stay disabled (or default-deny) on these tables.

```sql
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- BRIGADES ------------------------------------------------------------------
create table public.brigades (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text,
  presentation  text,
  email         text,
  phone_number  text,
  instagram     text,
  pix           text,
  acting_area   text,
  volunteers    integer default 0,
  foundation    date,
  address       text,
  state         text,
  city          text,
  latitude      double precision,
  longitude     double precision,
  image_url     text,
  brigade_id    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index brigades_state_city_idx on public.brigades (state, city);
create index brigades_name_trgm_idx  on public.brigades using gin (name gin_trgm_ops);

-- CONTACTS ------------------------------------------------------------------
create table public.contacts (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  email           text not null,
  phone           text,
  state           text,
  city            text,
  contact_reason  text not null,
  brigade_id      uuid references public.brigades(id) on delete set null,
  message         text not null,
  terms_accepted  boolean not null default false,
  created_at      timestamptz not null default now()
);
create index contacts_created_at_idx on public.contacts (created_at desc);

-- CAMPAIGNS -----------------------------------------------------------------
create table public.campaigns (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  description    text,
  body           text,
  category       text,
  category_color text,
  image_url      text,
  published_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index campaigns_category_idx     on public.campaigns (category);
create index campaigns_published_at_idx on public.campaigns (published_at desc);

-- FAQS ----------------------------------------------------------------------
create table public.faqs (
  id         uuid primary key default gen_random_uuid(),
  question   text not null,
  answer     text not null,
  position   integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index faqs_position_idx on public.faqs (position);

-- updated_at trigger -------------------------------------------------------
create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger trg_brigades_updated_at  before update on public.brigades  for each row execute function public.set_updated_at();
create trigger trg_campaigns_updated_at before update on public.campaigns for each row execute function public.set_updated_at();
create trigger trg_faqs_updated_at      before update on public.faqs      for each row execute function public.set_updated_at();

-- Aggregate stats (single round-trip; backend will fall back if missing) ---
create or replace function public.stats_summary()
returns json language sql stable as $$
  select json_build_object(
    'brigades',         (select count(*) from public.brigades),
    'volunteers_total', (select coalesce(sum(volunteers), 0) from public.brigades),
    'contacts',         (select count(*) from public.contacts),
    'campaigns',        (select count(*) from public.campaigns)
  );
$$;
```

---

## Auth0 setup

The backend verifies RS256 access tokens issued by Auth0. To obtain `AUTH0_AUDIENCE`:

1. Auth0 dashboard → **Applications → APIs → Create API**.
2. Pick an **Identifier** like `https://api.conexaobrigada.com`. This is your `AUTH0_AUDIENCE` — the value never has to resolve to a real URL.
3. Signing algorithm: **RS256** (default).
4. Save.

For the frontend to obtain a JWT instead of an opaque token:

1. Edit `src/app/auth_config.json` and set `"audience": "<your AUTH0_AUDIENCE>"`.
2. Update `Auth0Provider` so `authorizationParams` includes `audience`. Then call `getAccessTokenSilently()` and attach the result as `Authorization: Bearer <token>` on requests to write endpoints.

To smoke-test from the dashboard, open your API → **Test** tab → copy the example `access_token`. That token works against the running backend.

---

## API

All responses are JSON. Successful responses:
```json
{ "data": ... }
```
List responses also include `limit`, `offset`, and (when `?withCount=true`) a `count`. Errors:
```json
{ "error": { "message": "...", "code": "...", "requestId": "uuid", "details": ... } }
```
Every response includes a `X-Request-Id` header — quote it when reporting errors so the line can be found in the logs.

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/health` | public | liveness — always 200 |
| GET | `/ready` | public | readiness — pings Supabase |
| GET | `/api/brigades` | public | query: `state` (UF), `city`, `search`, `limit` ≤ 100, `offset` ≤ 10000, `withCount` |
| GET | `/api/brigades/:id` | public | UUID |
| POST | `/api/brigades` | required | body = `brigadeCreateSchema` |
| PUT | `/api/brigades/:id` | required | body = partial of create |
| DELETE | `/api/brigades/:id` | required | 204 |
| POST | `/api/contacts` | **public** | rate-limited (5/15min/IP); body uses camelCase `contactReason`, `brigade`, `terms` |
| GET | `/api/contacts` | required | admin view |
| GET | `/api/campaigns` | public | query: `category`, `limit`, `offset`, `withCount` |
| GET | `/api/campaigns/:id` | public | UUID |
| POST/PUT/DELETE | `/api/campaigns…` | required | |
| GET | `/api/faqs` | public | ordered by `position` |
| POST/PUT/DELETE | `/api/faqs…` | required | |
| GET | `/api/stats` | public | `{ brigades, volunteersTotal, contacts, campaigns }` |

### Contact form payload

```json
{
  "name": "Jane",
  "email": "jane@example.com",
  "phone": "(11) 91234-5678",
  "state": "SP",
  "city": "Campinas",
  "contactReason": "VOLUNTARIO",
  "brigade": "uuid-or-omitted",
  "message": "Hello",
  "terms": true
}
```

`contactReason` ∈ `VOLUNTARIO | DOACAO | FALAR_BRIGADA | CADASTRO | ADMINISTRADOR`. `terms` must be exactly `true`. The backend silently accepts a 201 if a `website` field is filled (honeypot for bots) — do not include it on the client.

---

## Smoke tests

```bash
curl http://localhost:4000/health
curl http://localhost:4000/api/brigades
curl 'http://localhost:4000/api/brigades?state=SP&search=mata'
curl http://localhost:4000/api/stats

# Public POST
curl -X POST http://localhost:4000/api/contacts \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test","email":"a@b.com","contactReason":"VOLUNTARIO","message":"hi","terms":true}'

# Auth-required (token from Auth0 dashboard → APIs → Test)
TOKEN=eyJhbGciOiJSUzI1NiIs...
curl -X POST http://localhost:4000/api/brigades \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Brigada Teste","state":"SP","city":"Campinas"}'
```

Expected behaviour:

- `POST /api/brigades` without token → `401 missing_token`
- Malformed body → `400 validation_error` with field-level details
- Body > 10 KB → `413 payload_too_large`
- 6th `POST /api/contacts` from the same IP within 15 min → `429 rate_limited`
- Disallowed `Origin` → `403 cors_denied`

---

## Project layout

```
src/
  index.ts                 entrypoint (signal handling, listen)
  app.ts                   express factory (helmet, cors, logging, routes)
  config/
    env.ts                 zod-validated env (fails fast at boot)
    logger.ts              pino with redaction for auth headers/tokens
  db/
    supabase.ts            lazy singleton service-role client
    brigades.ts            repo: all brigade Supabase calls
    contacts.ts            repo: contact insert/list
    campaigns.ts           repo
    faqs.ts                repo
  middleware/
    auth.ts                Auth0 RS256 verify (jwks-rsa)
    errorHandler.ts        central JSON error envelope
    notFound.ts            404 fallback
    rateLimit.ts           api + contact limiters
    requestId.ts           UUID per request, X-Request-Id header
  routes/
    index.ts               mounts all under /api
    brigades.ts contacts.ts campaigns.ts faqs.ts stats.ts
  controllers/
    brigades.ts contacts.ts campaigns.ts faqs.ts stats.ts
  schemas/                 zod schemas (one per resource)
  errors/HttpError.ts      typed errors + factories
  types/
    express.d.ts           augments Request with id + auth
    domain.ts              row interfaces
  utils/
    asyncHandler.ts        async → next(err)
    supabaseError.ts       error mapping + ILIKE escape
```

### A note on imports

This project uses Node ESM (`"type": "module"` + `module: NodeNext`). **Relative imports must include the `.js` extension** even though the source is `.ts`:

```ts
import { env } from './config/env.js';   // ✓ correct
import { env } from './config/env';      // ✗ won't resolve at runtime
```

This is a Node ESM rule, not a TypeScript one.

---

## Security model

- **Service role key** bypasses Supabase Row Level Security. All authorization happens in the Express layer; if `requireAuth` is omitted from a write route, that route is open. Audit `routes/*.ts` if in doubt.
- **Any valid Auth0 access token** for the configured audience grants writes. There is no role/scope check yet — if the Auth0 tenant allows public signup, every signed-in user can mutate. Restrict signup, or add scope checks to `requireAuth`, before relying on this in production.
- **JWT verification** pins `algorithms: ['RS256']`, validates issuer + audience, allows 5 s clock skew, and rate-limits JWKS fetches to 10/min so token floods can't DoS Auth0.
- **Public POST `/api/contacts`** is the only unauthenticated write. It is rate-limited (5 / 15 min / IP), capped at a 10 KB body, validates strictly with zod, and includes a honeypot field. Add CAPTCHA before opening the platform to the wider internet.
- **Errors** never include stack traces or Supabase internals. Codes are mapped: `23505 → 409 conflict`, `23503 → 400 invalid_reference`, `PGRST116 → 404 not_found`, everything else → `500 internal_error` with the actual error logged server-side.
- **Logs** redact `Authorization` headers, cookies, and any field path containing `password`, `token`, or `serviceRoleKey`. Do not add new logging that prints request bodies on `/api/contacts` (PII).

---

## Deployment notes

- Set `NODE_ENV=production` and `TRUST_PROXY=1` (or a CIDR) when running behind a load balancer.
- Health check: `GET /health` (no DB). Readiness: `GET /ready` (pings Supabase).
- Graceful shutdown: SIGTERM stops accepting new connections, drains in-flight requests, force-exits after 10 s.
- Single-process Node — for higher throughput, run multiple replicas behind a load balancer rather than `cluster`.

---

## Out of scope (for now)

Tests · Docker · file uploads (image fields take URL strings) · ESLint/Prettier · OpenAPI/Swagger · role-based authz · cursor pagination · audit log beyond `created_at`/`updated_at`.
