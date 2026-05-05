## Goal
Convert the project from TanStack Start (SSR, Cloudflare Workers) to a standard Vite + React SPA using `react-router-dom`, matching the classic Lovable template. This makes the build a static SPA suitable for GitHub Pages. All UI, components, styling, and functionality remain identical.

## Why
TanStack Start requires a Node/Cloudflare server runtime for SSR and server routes. GitHub Pages serves only static files, so SSR endpoints (`robots.txt`, `sitemap.xml`) and server functions cannot run there. Switching to a SPA build resolves the deployment target.

## Changes

### 1. Dependencies (`package.json`)
- Remove: `@tanstack/react-router`, `@tanstack/react-start`, `@tanstack/router-plugin`, `@cloudflare/vite-plugin`, `@lovable.dev/vite-tanstack-config`, `@vitejs/plugin-react`, `vite-tsconfig-paths`.
- Add: `react-router-dom@^6`, `@vitejs/plugin-react-swc`.
- Keep `@tanstack/react-query` (unrelated to router).

### 2. `vite.config.ts`
Replace with classic Lovable Vite config:
```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "./", // for GitHub Pages
  server: { host: "::", port: 8080 },
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
```

### 3. New entry files
- `index.html` (Vite SPA entry, references `/src/main.tsx`, includes the meta tags currently in `__root.tsx`).
- `src/main.tsx` — mounts `<App />` into `#root`, imports `./styles.css`.
- `src/App.tsx` — sets up `BrowserRouter` (or `HashRouter` for GH Pages — see Open Question), `<Routes>` for `/` and `/admin`, plus a `*` 404 route. Includes `<Toaster />`.

### 4. Convert routes
- `src/routes/index.tsx` → `src/pages/Index.tsx` — strip `createFileRoute` / `Route.head`, keep the component body. Move SEO meta into `react-helmet-async` OR inline into `index.html` (for the homepage). JSON-LD scripts can be injected via a small `useEffect` or `react-helmet-async`.
- `src/routes/admin.tsx` → `src/pages/Admin.tsx` — replace `useNavigate` from `@tanstack/react-router` with the one from `react-router-dom`. Remove `createFileRoute` wrapper.
- Delete `src/routes/robots[.]txt.tsx` and `src/routes/sitemap[.]xml.tsx` (server routes don't work on GH Pages). Replace with static `public/robots.txt` and `public/sitemap.xml` files containing the same content.
- Delete `src/routes/__root.tsx`, `src/router.tsx`, `src/routeTree.gen.ts`.

### 5. Update internal links
- Any `<Link to="...">` from `@tanstack/react-router` → `react-router-dom` equivalent.
- `useNavigate({ to: "/" })` → `navigate("/")`.
- Search the codebase (`Header.tsx`, `Footer.tsx`, etc.) for TanStack imports and migrate.

### 6. SEO / meta
- Move the homepage `<title>`, description, OG tags, and JSON-LD into `index.html` directly (since it's the primary indexed page).
- For `/admin`, add `react-helmet-async` or set `document.title` in a `useEffect` (it's `noindex` anyway).

### 7. `tsconfig.json`
- Remove `vite.config.ts` from `include` if needed; keep the `@/*` path alias.

### 8. GitHub Pages workflow
The existing `.github/workflows/deploy.yml` already builds and publishes `./dist` — works as-is once the build outputs a static SPA. Add a `public/404.html` that copies `index.html` (SPA fallback for GH Pages deep links) if `BrowserRouter` is used.

## Files removed
- `src/router.tsx`
- `src/routeTree.gen.ts`
- `src/routes/__root.tsx`
- `src/routes/robots[.]txt.tsx`
- `src/routes/sitemap[.]xml.tsx`
- `src/routes/index.tsx` (moved to `src/pages/Index.tsx`)
- `src/routes/admin.tsx` (moved to `src/pages/Admin.tsx`)
- `wrangler.jsonc` (no longer needed)

## Files added
- `index.html`
- `src/main.tsx`
- `src/App.tsx`
- `src/pages/Index.tsx`
- `src/pages/Admin.tsx`
- `src/pages/NotFound.tsx`
- `public/robots.txt`
- `public/sitemap.xml`
- `public/404.html` (SPA fallback)

## Open Question
GitHub Pages serves under a subpath like `username.github.io/repo/`. Two options:
1. **HashRouter** — URLs become `/#/admin`. Works on any GH Pages setup with zero config. Less clean URLs.
2. **BrowserRouter + base path** — clean URLs, requires setting `base: "/repo-name/"` in `vite.config.ts` and a `404.html` SPA fallback.

I'll default to **BrowserRouter** with `base: "./"` and a `404.html` fallback (works on both root and subpath deployments). Let me know if you'd prefer HashRouter.
