# Comidini Project Overview

**Comidini** is a gastronomic platform designed to connect restaurants with diners. It is a monorepo containing multiple frontend applications and a backend API, utilizing a modern TypeScript stack.

## Architecture

The project is a **TurboRepo** monorepo managed with **PNPM**.

### 📂 Apps (`/apps`)
*   **`admin`**: React/Vite admin dashboard for platform administrators.
*   **`shop`**: React/Vite application for restaurant owners to manage menus and orders.
*   **`web`**: React/Vite consumer-facing application for diners.
*   **`api`**: Node.js/Express backend service.

### 📦 Packages (`/packages`)
*   **`@repo/auth`**: Authentication logic using **Better Auth**.
*   **`@repo/db`**: Database schema, types, and client using **Drizzle ORM** and **PostgreSQL**.
*   **`@repo/ui`**: Shared UI components library (ShadCN, Tailwind CSS).
*   **`@repo/email`**: Email service integration.
*   **`@repo/storage`**: File storage service (likely S3/MinIO compatible).
*   **`@repo/typescript-config`**: Shared TypeScript configurations.

## Technology Stack

*   **Languages:** TypeScript, Node.js
*   **Frontend:** React 19, Vite, TanStack Router, TanStack Query, Tailwind CSS.
*   **Backend:** Express.js.
*   **Database:** PostgreSQL, Drizzle ORM.
*   **Tooling:** TurboRepo, Biome (Linting/Formatting), Docker.

## Key Development Commands

Run these from the root directory:

*   **Start Development:** `pnpm dev` (Runs all apps/packages in parallel via Turbo)
*   **Build Project:** `pnpm build`
*   **Lint Code:** `pnpm lint`
*   **Database Management:**
    *   Start DB Container: `pnpm db:start`
    *   Migrate DB: `pnpm db:migrate`
    *   Generate Migrations: `pnpm db:generate`
    *   Open Drizzle Studio: `pnpm db:studio`

## Development Conventions

*   **Async/Await:** Always prefer `async/await` over `.then()`.
*   **Imports:** Use workspace aliases (e.g., `@repo/ui`) instead of relative paths for shared packages.
*   **Naming:**
    *   Components: `PascalCase`
    *   Functions/Variables: `camelCase`
    *   Files: `kebab-case`
    *   Constants: `SCREAMING_SNAKE_CASE`
*   **Database:**
    *   Schemas location: `packages/db/src/schema`
    *   Types location: `packages/db/src/types`
*   **Documentation:** Refer to `AGENTS.md` and `docs/` for specific workflows (e.g., adding new endpoints).

## Workflow Tips for AI Agents

1.  **Check `AGENTS.md`**: Before deep changes, review specific agent guidelines.
2.  **Reuse `@repo/ui`**: Check for existing components before creating new ones.
3.  **Strict Typing**: Ensure all code is strongly typed; use shared types from `@repo/db`.
4.  **Endpoint Creation**: Follow the guide in `docs/new-endpoint.md`.
5.  **Endpoint Usage**: Follow the guide in `docs/use-endpoint.md`.
