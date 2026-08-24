# Adimy CMS - AI Rules & Architecture Guidelines

Welcome, AI Agent! You are working on **Adimy CMS**, a headless, modular CMS built with Next.js 16 (App Router), Prisma, and Tailwind CSS.
The user wants you to easily extend and modify this codebase without breaking its core architecture or its visual identity. 

Follow these strict rules when making modifications:

## 1. Project Architecture
- **Framework**: Next.js 16 (App Router). Route handlers should use asynchronous `params` (`const slug = (await params).slug`).
- **ORM**: Prisma (SQLite default). Schema is located in `prisma/schema.prisma`. 
- **Styling**: Tailwind CSS with a "Fluent Design / Microsoft" aesthetic (Glassmorphism, Backdrop Blur, Mesh Gradients).

## 2. Adding New Features & Sidebar Items
Do **NOT** hardcode new modules directly into the `Sidebar.tsx` component.
If the user asks you to add a new section, page, or integration to the menu:
1. Open `src/adimy.config.ts`.
2. Append your new route configuration to the `navItems` array within `adimy.config.ts`.
3. Create the corresponding Next.js route in `src/app/...`.

## 3. Visual & Aesthetic Guidelines (CRITICAL)
Adimy uses a premium, modern design. When creating new components or pages, you MUST maintain the aesthetic:
- **Glassmorphism**: Use `bg-white/60 backdrop-blur-md border border-slate-200/50` for cards and panels.
- **Shadows & Rounded Corners**: Use `rounded-2xl shadow-sm` for most container elements.
- **Colors**: Rely on `text-gray-900` for headings, `text-gray-500` for descriptions, and `blue-600` for primary actions. Do not use generic solid colors for backgrounds; rely on the global mesh gradient provided by `DashboardLayout.tsx`.
- **Icons**: Always use `lucide-react` icons.

## 4. Prisma & Database Updates
- If you need to add new core tables to the CMS (not dynamic user collections, but system tables like Users, Settings), add them to `prisma/schema.prisma`.
- The user's dynamic collections are stored generically in the `SchemaCollection`, `SchemaField`, and `Document` models. You usually do not need to modify the schema for user-created content.

## 5. Server Actions
All database mutations should be done via Server Actions (`'use server'`). Place new actions in `src/core/<module>/actions.ts`.

By following these rules, you ensure that Adimy remains stable, beautifully designed, and highly extensible.
