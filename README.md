# Gatewise

A production-grade Role-Based Access Control (RBAC) portal.

## Stack

- **Frontend**: Angular 17 (`client/`)
- **Backend**: Node.js + Express + TypeScript REST API (`server/`)
- **Auth**: JWT with role-based access (`General User` / `Admin`)
- **Storage**: Pluggable — local JSON fallback + DynamoDB adapter

## Project Structure

```
client/   Angular 17 SPA
server/   Express + TypeScript API
docs/     DECISIONS.md (Architecture Decision Records)
```
