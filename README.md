# Warsaw Beauty Salon Explorer — `beauty-services`

A premium full-stack monorepo application to explore, filter, and edit beauty salons across Warsaw, Poland, featuring live map boundaries synchronization and responsive styling.

---

## 📦 Quick Start Guide

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js 22+](https://nodejs.org/)

### Setup Commands

```bash
# 1. Clone environment variables
cp .env.example .env

# 2. Spin up containers (PostgreSQL database + Fastify API + Next.js App)
docker compose up -d

# 3. Create and push schemas to PostgreSQL
npm run db:push -w backend

# 4. Seed database with 147 real pre-collected Warsaw salons (no API key needed!)
npm run seed -w scripts
```

### Application URLs

- **Web Application:** [http://localhost:3000](http://localhost:3000)
- **REST API Server:** [http://localhost:3001](http://localhost:3001)
- **Interactive Swagger UI:** [http://localhost:3001/docs](http://localhost:3001/docs)

---

## 🚀 Core Features

- **Split-Panel Layout:** Desktop split panel showing interactive Leaflet maps on the right and paginated card listings on the left.
- **Bidirectional Map Synchronization:**
  - Click a list card $\rightarrow$ pans and zooms the map to its custom marker pin with active pulse animations.
  - Click a map pin $\rightarrow$ expands the list card and scrolls it smoothly into view.
- **Airbnb-Style Viewport Sync:** Check "Search as I move map" to filter salons in real-time as you pan or zoom. On mobile viewports, bounds checking is bypassed automatically when the map is hidden for a seamless UX.
- **Inline Editor:** In-place details editing with regex validations (website, phone formats) and custom tags chip adder.
- **Database-Integrated CI:** Monorepo GitHub Actions workflow runs lints, typechecks, production builds, pushes schemas, and executes DB seeding.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 15 (App Router), Tailwind CSS, Lucide icons, Leaflet Map.
- **Backend:** Fastify API, TypeScript, `@fastify/swagger` auto-docs.
- **Database & ORM:** PostgreSQL container, Drizzle ORM, Zod schemas.

---

## 📈 What I'd Improve With More Time

1. **Improve Design & UX:** The current layout sizes are suboptimal; with more time, I would build a fluid full-screen responsive dashboard, refine component paddings/margins for a premium visual feel, and add smooth page transitions.
2. **Database Caching:** Integrate **Redis** caching for the high-volume `/salons` endpoints to reduce database load and ensure sub-10ms response times.
3. **Comprehensive Test Coverage:** Set up a full automated testing suite including unit testing (Vitest), component assertions (React Testing Library), and E2E integration tests (Playwright) to safeguard map interactions and form submissions.
4. **Data Quality & Quantity:** Expand scraper scripts to gather thousands of beauty spaces across Poland, adding operational hours, rich price ranges, and customer-uploaded image support.
