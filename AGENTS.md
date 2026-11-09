<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# roles-app: rules for agents

A Next.js 16 app with three roles (`IT`, `manager`, `user`), an in-memory store, a users directory and a paginated clients table. `README.md` lists the seed accounts (all with password `password`), the product assumptions and the curl checks.

## Run, build, check

- `npm run dev` starts on :3000. Next allows only **one** `next dev` per project; if one is running, test against it instead of starting another.
- `npm run typecheck` runs `next typegen` first. `PageProps<'/route'>` and `RouteContext<'/route'>` are generated globals, so plain `tsc` fails on a fresh clone.
- `npm run lint`, then `npm run build`. The build is what catches Cache Components errors (see below).
- There is no test runner. Verify with the curl tables in `README.md` ("Manual API checks"). All data, **including sessions**, lives in memory: a server restart (and adding or removing `src/proxy.ts`) logs everyone out and resets every edit.
- zsh is the shell: an unquoted `$var` is not word-split, and an unmatched glob aborts the whole line.

## Where things live

| Layer | Files | May import |
| --- | --- | --- |
| Access rules | `src/lib/access.ts` | nothing |
| Store and seed | `src/lib/db.ts`, `src/lib/seed.ts` (`server-only`) | `types`, `access` (types only) |
| Services: every rule and every write | `src/lib/users.service.ts`, `src/lib/clients.service.ts` (`server-only`) | `db`, `access`, `dto`, `http`, `schemas` |
| Session | `src/lib/auth.ts` (`server-only`); cookie name in `session-cookie.ts` | `db`, `http` |
| API routes | `src/app/api/**/route.ts` | `auth`, `http`, `schemas`, services |
| Pages (server components) | `src/app/**/page.tsx` | `page-guards`, services, `access`, `schemas` |
| Client components (`'use client'`) | `login-form`, `user-row`, `create-user-form`, `logout-button` | `access` and `dto` **types** only; never `db`, `auth`, services |
| Proxy | `src/proxy.ts` | `session-cookie` only |

- Routes are thin: `requireUser()` (401) → `Schema.parse(body)` (400) → one service call. Wrap every handler in `route()` from `http.ts`; it maps `HttpError`, zod and bad-JSON errors to `{ error: { code, message } }` and rejects cross-origin mutations (403 `bad_origin`).
- Pages call services directly and never `fetch` their own API.
- Anything sent to the browser goes through `toPublicUser()` (an allowlist). Never spread a `User` (`{...user}`): it carries the plaintext password.

## Rules an agent will be tempted to break

1. **Permission checks live on the server, only through `can()`.** Never write `role === '…'`, `role !== '…'`, or compare roles with `<`/`>=` outside `access.ts`. Roles are not a ladder: **IT does not have `content:view`**, so IT gets 403 on `/content`. To ask "does this user see everyone?" use `can(user, 'user:list-all')`, not a role name.
2. **The client is never trusted.** Show/hide flags in the UI (`allowed` in `user-row.tsx`, the links in `header.tsx`) are hints. Hiding a button is never the protection; the service must reject the request on its own.
3. **The current user comes from `getCurrentUser()` / `requireUser()`**, which re-reads the store on every request. Never take an id or role from the body, a query param, or a value cached earlier. That re-read is what makes deactivation apply on the next request (rule 5); do not replace sessions with a JWT or cache the user.
4. **The clients list is paginated on the server.** Use `listClients(user, PageQuerySchema.parse(...))`; `limit` is capped at 100. Never add a `getAllClients()`, never send `db.clients` to a client component, and never paginate in the browser.
5. **Role strings appear only in `src/lib/access.ts` and `src/lib/seed.ts`.** Elsewhere use `ROLES`, `Role`, `LANDING_PAGE` and permissions. `grep -rnE "'(IT|manager|user)'" src` must match nothing outside those two files.
6. **Validate with zod 4 strict schemas** (`z.strictObject`, `z.email()`), so an unknown field such as `isAdmin` is a 400, not silently ignored.

## Counter-intuitive things

- **The order of checks in `updateUser` is deliberate:** target lookup → per-field `can()` → email unique (409) → **rule 4, last active IT (409)** → rule 3, no self-change (403) → write. Rule 4 comes before rule 3 so the last active IT deactivating themselves gets `last_active_it`, not `self_change`. Keep the services synchronous: no `await` between the checks and the write.
- **Unknown ids:** IT gets 404; everyone else gets 403 for both "not yours" and "does not exist", so ids can't be probed.
- **A deactivated user can do nothing** (`can()` returns false), but IT can still edit a deactivated manager's reports.
- **Rule 4 counts users by permission** (`can(u, 'user:change-role')`), not by the role name `'IT'`.
- **Cache Components is on.** Every page that reads the session sets `export const instant = false`. Without it, the build fails, or `forbidden()` streams with a 200 status instead of a real 403.
- **`redirect()`, `forbidden()` and `notFound()` throw.** Never call them inside `try/catch`; catch the service error first, then call them outside (see `content/client/[id]/page.tsx`).
- **The proxy is not security.** `src/proxy.ts` only checks that a `sid` cookie exists. A forged or stale cookie passes it, and the page guard rejects it.
- **The file is `proxy.ts`, not `middleware.ts`**, and `params`/`searchParams` are promises (`await params`).

## Adding a fourth role

1. Add it to `ROLES` in `src/lib/access.ts`. The compiler then forces a row in `ROLE_PERMISSIONS` and in `LANDING_PAGE`; fill both from the existing permissions. Add a new `Permission` only if no existing one fits, and give it a row in `FIELD_PERMISSION` if it guards a patch field.
2. If the role should edit only its own reports, extend the manager `if` in `can()`. It is the one place that names a role inside the rules.
3. Add a seed user in `src/lib/seed.ts` and a row in the README's seed table.
4. Change nothing else. Schemas, dropdowns, guards and services read `ROLES` and `can()`. If you find yourself editing a page or service to mention the new role, stop: express it as a permission instead.
5. Run typecheck, lint and build, then the README curl checks while logged in as the new role.

## Conventions

- Name the signed-in person `user`, never `actor`.
- Formatting: no semicolons, single quotes, two-space indent.
- Commit messages are one sentence. Do not add AI co-author or "generated with" lines.
