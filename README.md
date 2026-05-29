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

# 2. Install monorepo dependencies locally
npm install

# 3. Spin up PostgreSQL database & web containers in background
docker compose up -d

# 4. WAIT 5 seconds for PostgreSQL to finish internal initialization!
# (Running database migrations before PostgreSQL is healthy will throw connection errors)
sleep 5

# 5. Create and push schemas to PostgreSQL
npm run db:push -w backend

# 6. Seed database with 1,392 real Warsaw salons (no Google API key needed!)
npm run seed -w scripts
```

### Application URLs

- **Web UI Dashboard:** [http://localhost:3000](http://localhost:3000)
- **REST API Server:** [http://localhost:3001](http://localhost:3001)
- **Interactive Swagger UI:** [http://localhost:3001/docs](http://localhost:3001/docs)

---

## 📡 Live Google Places API Data Collection (Optional)

The monorepo contains a data collection script under [`scripts/src/collect.ts`](file:///Users/omatviiv/try/SumUp/beauty-services/scripts/src/collect.ts) that queries the **official Google Places API directly** (Nearby Search + Place Details endpoints) to fetch live records.

> [!IMPORTANT]
> Google requires a valid credit card or billing profile to query the Places API. You must register billing details at [https://console.cloud.google.com/](https://console.cloud.google.com/) before accessing these services.

### API Credentials Setup

1. **Create GCP Project:** Go to the [Google Cloud Console](https://console.cloud.google.com/), log in, and create a new project.
2. **Enable Billing:** Enable active billing on your project in the sidebar menu.
3. **Enable Places API:** Navigate to **APIs & Services > Library**, search for **Places API**, and click **Enable**.
4. **Generate API Key:** Under **APIs & Services > Credentials**, click **Create Credentials** and copy the generated **API Key**.
5. **Configure Environment:** Assign the key in your root `.env` file:
   ```env
   GOOGLE_PLACES_API_KEY=your_copied_api_key
   ```
6. **Run Live Collector:**
   ```bash
   npm run collect -w scripts
   ```

---

## 🚀 Key Features

- **Split-Panel Dashboard:** Desktop views feature card listings on the left and interactive Leaflet maps on the right.
- **Mobile-Responsive Adaptability:** Pivots to single-column swipe navigation tabs on mobile screens, utilizing a custom CSS Flexbox height constraint to ensure independent card scrollability.
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
