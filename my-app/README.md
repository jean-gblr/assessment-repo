## Rick & Morty Character Browser

A Next.js app that uses the **Rick & Morty GraphQL API** via **Apollo Client** to browse characters with search, filters, pagination, and a details modal.

UI is built with **HeroUI** components (see docs: [HeroUI Introduction](https://www.heroui.com/docs/guide/introduction)).

## Getting Started

First, run the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech

- Next.js App Router
- Apollo Client (`@apollo/client`) + GraphQL
- HeroUI (`@heroui/react`) + Tailwind CSS v4

## Project structure (key files)

- `app/providers.tsx`: Apollo + HeroUI providers
- `app/character-browser.tsx`: main UI + GraphQL query
- `tailwind.config.ts`: HeroUI Tailwind plugin (`heroui()`)

## Build

```bash
bun run build
```
