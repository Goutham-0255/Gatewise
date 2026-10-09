# Architecture Decision Records (ADR)

## ADR-001: Monorepo Structure
**Decision**: Single repository with `client/` (Angular) and `server/` (Express) as separate npm projects, plus `docs/`.  
**Reason**: One place to review the whole system, shared conventions, and API and UI changes that can land together.

## ADR-002: Pluggable Storage
**Decision**: Handlers depend only on repository interfaces (`IUserRepository`, `IRecordRepository`). `RepositoryFactory` picks the adapter from `STORAGE_ADAPTER`: `json` (the default) uses `JsonUserRepository` and `JsonRecordRepository` over `server/src/data/*.json`, and `dynamo` selects `DynamoUserRepository`.  
**Reason**: The app runs locally with zero setup, and moving to DynamoDB means adding adapters, not changing business logic.  
**Status**: The DynamoDB user adapter is a stub (every method throws "Not implemented"; target table `gatewise-users`, partition key `id`, GSI on `username`). There is no Dynamo records adapter yet, so `createRecordRepository()` throws for `dynamo`.

## ADR-003: Conventional Commits & Branch Naming
**Decision**: Branches follow `type/description` and commits follow `type(scope): message`. Each step got its own branch, merged into `main` through a pull request: `chore/repo-setup`, `feat/server-scaffold`, `feat/auth-api`, `feat/users-api`, `feat/records-api`, `feat/client-scaffold`, `feat/auth-ui`, `feat/dashboard-and-admin-ui` (dashboard and admin UI steps combined), `feat/async-demo-and-docs` (async demo and final docs combined).  
**Reason**: It keeps the history readable and makes each change reviewable on its own.

## ADR-004: JWT Authentication
**Decision**: On login the server issues a stateless JWT signed with `JWT_SECRET` using HS256, with a 1-hour expiry (`expiresIn: '1h'`). The payload is `{ userId, username, role }`. The client sends it as `Authorization: Bearer <token>`, and `authenticate` verifies it with `algorithms: ['HS256']` pinned, so tokens using other algorithms are rejected.  
**Reason**: No server-side session store is needed, which keeps the API simple and independent of the storage adapter.

## ADR-005: RBAC via Middleware and Route Guards
**Decision**: The server enforces access with `authenticate` and `requireRole('Admin')` middleware. The users router uses `router.use(authenticate, requireRole('Admin'))`. The records router uses `authenticate` and filters by role in the handler (Admins get all records, others only their own `userId`). The role always comes from the stored user at login, never from the request body. The client mirrors this with functional guards (`authGuard`, `adminGuard`, `guestGuard`) and hides the Users link for non-admins.  
**Reason**: The server is the source of truth for access. The client guards only improve the UX and are never trusted for security.

## ADR-006: Atomic JSON Writes
**Decision**: `JsonUserRepository` writes the whole array to `users.json.tmp` and then `fs.rename`s it over `users.json`. The records repository is read-only for now, and any write added there must use the same temp-file + rename pattern.  
**Reason**: A crash mid-write can never leave a half-written data file.  
**Note**: `npm run build` copies `src/data` to `dist/src/data`, because the compiled repositories resolve the data files relative to their own location.

## ADR-007: Input Validation and Capped `?delay`
**Decision**: Request bodies are validated with zod at the route boundary:
- Login needs a non-empty username and password.
- Creating a user needs a trimmed username of 3 to 30 characters, a valid email, a password of at least 8 characters, and a role of `Admin` or `General User`.
- An update is a partial version of that and must change at least one field.

Validation failures return `400 { message: 'Validation failed', errors: [{ field, message }] }`.

The `?delay` query param is handled by `delay` middleware. It parses the value and clamps it to 0 to `MAX_DELAY_MS` (5000 ms); anything non-numeric, negative or repeated means no delay. It runs after `authenticate`.  
**Reason**: Bad input is rejected early with clear errors. The cap, and placing the middleware after authentication, stop `?delay` from being used to tie up the server.

## ADR-008: Configuration via Environment Variables
**Decision**: Server settings come from environment variables loaded with dotenv: `PORT` (default 3000), `JWT_SECRET` (required; the server refuses to start without it), `STORAGE_ADAPTER` (default `json`), and `CLIENT_ORIGIN` (default `http://localhost:4200`). Only `.env.example` is committed, and `.env` is gitignored. The client's API URL lives in `environment.ts` and `environment.prod.ts`, with a production `fileReplacements` entry in `angular.json`.  
**Reason**: No secrets in Git, and the same build runs in any environment.

## ADR-009: Token Storage in localStorage
**Decision**: The client stores the JWT in `localStorage` (`gatewise_token`) and sends it as an `Authorization: Bearer` header through an HTTP interceptor.  
**Reason**: Simple for a SPA talking to a separate API: no cookies, so no CSRF tokens or same-site cookie setup.  
**Tradeoff**: Any XSS could read the token. We limit that with Angular's built-in template escaping, no `innerHTML`, a 1-hour token lifetime, and server-side authorization on every route. httpOnly cookies would be stronger but need CSRF protection and same-site configuration.  
The login form deliberately has no role selector: the server derives the role from the stored user and ignores any role sent in the request.

## ADR-010: IDs from `crypto.randomUUID()`
**Decision**: New user ids come from Node's built-in `crypto.randomUUID()`.  
**Reason**: The `uuid` package (v14) is ESM-only and cannot be `require`d from this CommonJS build. The built-in function needs no dependency. (`uuid` is still listed in `server/package.json` but is not used.)

## ADR-011: CORS Allow List
**Decision**: `cors` is configured with an array of allowed origins taken from `CLIENT_ORIGIN` (comma-separated, default `http://localhost:4200`).  
**Reason**: With a single string, the `cors` package sends that origin as `Access-Control-Allow-Origin` to every caller. With an array, it reflects only matching origins, so unknown origins get no allow-origin header. The env var lets a deployed client URL be allowed without code changes.

## ADR-012: Server TypeScript Pinned to 5.x
**Decision**: The server uses TypeScript 5.9, not 7.  
**Reason**: `ts-node` and `ts-node-dev` (used by `npm run seed` and `npm run dev`) depend on the TypeScript compiler API, which TypeScript 7 no longer provides.

## ADR-013: Client Structure and Lazy Standalone Routes
**Decision**: The Angular 17 client uses standalone components only, the new control flow syntax (`@if`, `@for`, `@switch`), functional guards and interceptors, and lazy `loadComponent` routes. The code is grouped into `core/` (services, guards, interceptors, models), `features/` (auth, dashboard, admin) and `shared/` (reusable components and pipes). `/dashboard` and `/admin` share one layout component (`DashboardShellComponent`) as their parent route, with child routes `records` and `users`.  
**Reason**: Each page is its own small lazy chunk, there are no NgModules to maintain, and feature code stays separate from cross-cutting concerns.

## ADR-014: Async Demo: Loading Interceptor, Progress Bar and switchMap
**Decision**:
- A functional `loadingInterceptor` counts in-flight calls to the API (`finalize` also covers errors and cancellations), and `LoadingService` exposes `isLoading$`.
- The top progress bar appears only after a call has been pending for 100 ms, which avoids flicker on fast requests.
- The delay slider emits through `debounceTime(300)` and `distinctUntilChanged()`.
- The records stream (`createRecordsStream`) uses `switchMap`, so a new delay or a Retry cancels the previous request.

**Reason**: Global loading feedback lives in one place instead of every component. Debouncing avoids a request per slider step. `switchMap` guarantees a slow older response can never overwrite a newer one, which a unit test covers.

## ADR-015: Client-side Pagination for Users
**Decision**: The admin users list loads all users once and pages them in the browser (5 per page) with a pure `paginate()` helper. The helper clamps the page, so deleting the last row of a page steps back.  
**Reason**: The user count is small and the API stays simple. If the user base grows, pagination should move to the server (`?page`/`?limit`).
