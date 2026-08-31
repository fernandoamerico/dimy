# Dimy CMS - AI Rules & Architecture Guidelines

Welcome, AI Agent! You are working on **Dimy CMS**, a headless, modular CMS.
The user wants you to easily extend and modify this codebase without breaking its core architecture. 

Follow these strict rules when making modifications:

## 1. Project Architecture (Backend is Go!)
- **Core Engine**: Go (Golang 1.22+). The backend handles ALL routing, database queries, and API endpoints. 
- **Database**: SQLite (dev) / PostgreSQL (production) using native `database/sql` drivers (`go-sqlite3` and `pgx`). **DO NOT USE PRISMA OR NODE.JS FOR BACKEND DATA**.
- **Frontend Panel**: A Next.js 15 SPA in the `frontend/` directory. It uses `output: 'export'` to generate a static site that is embedded into the Go binary (`//go:embed`).
- **No Server Actions**: The Next.js frontend is strictly a client-side SPA. Do not use Next.js `route.ts` or `"use server"` for data fetching. It must call the Go REST API (`/api/...`).

## 2. API Authentication & Permissions
- **Admin Panel**: Uses a stateless JWT stored in an `HttpOnly` cookie (`dimy_session`).
- **Headless API Clients**: Authenticate via `Authorization: Bearer <Token>`. Tokens are managed in the `api_keys` table.
- **Content Reading**: Managed by `handlers/content.go`. Se uma coleção tem `is_public: true` em seu metadata, ela pode ser lida livremente por chamadas GET. Caso contrário, exige autenticação válida (Cookie de painel ou API Key).
- **Middleware**: `handlers/middleware.go` contém a função `RequireAuth` (que verifica cookie e token) e o helper `IsAuthenticated`.

## 3. Database Modifications
- When modifying models, adjust the initial SQL migrations in `db/migrations.go`.
- Use strictly parameterized queries (e.g. `WHERE id = $1`) to prevent SQL injection and support both SQLite and PostgreSQL.

## 4. Visual & Aesthetic Guidelines (Frontend)
- **Glassmorphism**: Use `bg-white/60 backdrop-blur-md border border-slate-200/50` for cards and panels.
- **Shadows & Rounded Corners**: Use `rounded-2xl shadow-sm`.
- **Colors**: Rely on `text-gray-900` for headings, `text-gray-500` for descriptions, and `blue-600` for primary actions. 
- **Icons**: Always use `lucide-react` icons.

By following these rules, you ensure that Dimy remains stable, secure, and purely driven by its lightning-fast Go engine.
