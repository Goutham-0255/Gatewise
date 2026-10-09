# Architecture Decision Records (ADR)

## ADR-001: Monorepo Structure
**Decision**: Single repository with `client/` and `server/` as separate sub-projects.  
**Reason**: Simplifies submission, unified API contract sharing, and cleaner evaluation.

## ADR-002: Pluggable Storage
**Decision**: Repository pattern with a local JSON file fallback and DynamoDB adapter.  
**Reason**: The app runs locally with zero setup, and switching to DynamoDB only means swapping the adapter, not the business logic.

## ADR-003: Conventional Commits & Branch Naming
**Decision**: All branches follow `type/description` naming. All commits follow `type(scope): message`. The initial setup branch is `chore/repo-setup` (the plan's `feat/project-scaffold` step).  
**Reason**: Standard practice — makes the Git history readable and professional.

## ADR-004: JWT Authentication
**Decision**: Stateless JWTs signed with a server secret, sent as `Authorization: Bearer <token>`, with a short expiry.  
**Reason**: No server-side session store is needed, which keeps the API simple and works with either storage adapter.

## ADR-005: RBAC via Middleware and Route Guards
**Decision**: The server enforces roles with an `authorize(...roles)` Express middleware; the client mirrors it with Angular route guards and hides UI the role cannot use.  
**Reason**: The server is the source of truth for access; client guards only improve UX and are never trusted for security.

## ADR-006: Atomic JSON Writes
**Decision**: The JSON adapter writes to a temp file and then renames it over `db.json`.  
**Reason**: Prevents a corrupted database if the process crashes mid-write.

## ADR-007: Input Validation and Capped `?delay`
**Decision**: All request bodies and query params are validated at the route boundary; the `?delay` param used to simulate latency is capped at a fixed maximum.  
**Reason**: Rejects bad input early with clear 400 errors and stops `?delay` from being used to tie up the server.

## ADR-008: Configuration via Environment Variables
**Decision**: Secrets and settings (JWT secret, port, storage driver, AWS config) come from environment variables; only `.env.example` is committed.  
**Reason**: No secrets in Git, and the same build runs in any environment.
