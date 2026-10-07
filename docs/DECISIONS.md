# Architecture Decision Records (ADR)

## ADR-001: Monorepo Structure
**Decision**: Single repository with `client/` and `server/` as separate sub-projects.  
**Reason**: Simplifies submission, unified API contract sharing, and cleaner evaluation.

## ADR-002: Pluggable Storage
**Decision**: Repository pattern with a local JSON file fallback and DynamoDB adapter.  
**Reason**: Works out-of-the-box with zero setup, while demonstrating cloud DB knowledge.

## ADR-003: Conventional Commits & Branch Naming
**Decision**: All branches follow `type/description` naming. All commits follow `type(scope): message`.  
**Reason**: Industry standard practice — makes the Git history readable and professional.