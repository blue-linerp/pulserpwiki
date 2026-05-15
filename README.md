# Pulse RP Wiki

A custom community wiki for the **Pulse RP** FiveM roleplay server. Built with Next.js 14 (App Router), TypeScript, and Tailwind CSS. Inspired by Fandom's wiki layouts but with its own premium FiveM gaming identity.

## Features

- Fandom-style wiki layout: top navbar, collapsible left sidebar, central article, right-side infobox.
- 18+ pre-written articles covering departments, systems, world, and guides.
- Dark FiveM-inspired theme (black, crimson, red accents).
- Reusable components: `Navbar`, `Sidebar`, `WikiArticle`, `WikiInfobox`, `CategoryGrid`, `TableOfContents`, `Breadcrumbs`, `RecentChanges`, `Footer`, `Search`, `Logo`.
- Frontend search with live filtering.
- Fully responsive (desktop / tablet / mobile with collapsible sidebar).
- Routing via `app/wiki/[slug]/page.tsx`.

## Quick start

1. Copy `.env.example` to `.env.local` and fill in:
   - `STEAM_API_KEY` — get one from https://steamcommunity.com/dev/apikey
   - `SITE_URL` — e.g. `http://localhost:3000`
   - `SESSION_SECRET` — any random 32+ char string
2. Install and run:

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Authentication & Admin

- Click **Sign in with Steam** in the navbar.
- The very first user to sign in is automatically promoted to **admin**.
- Admins see an active **Edit** button on every article (top-right) and a **Create New Page** action in the user menu.
- Admins can:
  - Edit any built-in or custom page (title, subtitle, description, intro, sections, tags, related pages).
  - Upload images via `/api/upload` (stored in `public/uploads/`, max 4 MB).
  - Set hero images and infobox images.
  - Edit infobox title, image, and field rows.
  - Delete custom pages, or revert built-in pages to their bundled defaults.
- Custom Character pages (category `Character`) are automatically listed on `/wiki/characters`.

### Creating a Character page (example)

1. Sign in → user menu → **Create New Page**.
2. Slug: `character-zachary-kane`
3. Title: `Zachary Kane`, Subtitle: `Captain — Los Santos Joint Police Department`
4. Category: `Character`
5. Fill in intro, sections, infobox fields, upload a portrait, save.
6. The page is now live at `/wiki/character-zachary-kane` and shows up on the Characters page.

## Data & storage

- SQLite database at `data/wiki.db` (auto-created).
- Uploaded images at `public/uploads/`.
- Built-in pages live in `src/data/pages/*.ts` and are used as defaults; DB rows override them per-slug.

## File structure

```
src/
  app/
    layout.tsx
    page.tsx              # Main wiki home
    not-found.tsx
    wiki/[slug]/page.tsx  # Dynamic article route
  components/
    Layout.tsx
    Navbar.tsx
    Sidebar.tsx
    Search.tsx
    Logo.tsx
    Footer.tsx
    Breadcrumbs.tsx
    CategoryGrid.tsx
    RecentChanges.tsx
    TableOfContents.tsx
    WikiArticle.tsx
    WikiInfobox.tsx
  data/
    types.ts
    categories.ts
    sidebar.ts
    recent.ts
    pages/
      index.ts
      core.ts
      departments.ts
      systems.ts
      world.ts
  styles/
    globals.css
```

## Adding a page

Append a `WikiPage` object to one of the files in `src/data/pages/*.ts`. It is automatically picked up by:

- `/wiki/[slug]` dynamic route
- search index
- `All Pages` view

## Notes

This project is community-built and **not affiliated with Rockstar Games or Take-Two Interactive**.
