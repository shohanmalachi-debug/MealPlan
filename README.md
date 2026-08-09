# MealPlan

A family weekly meal planner with Asian and Sri Lankan flavours, difficulty ratings, and consolidated shopping lists.

## Run locally

```bash
npm install
cp .env.local.example .env.local   # add your UNSPLASH_ACCESS_KEY / PEXELS_API_KEY
npm run dev
```

Open http://localhost:3000.

## Run with Docker

```bash
cp .env.local.example .env.local   # add your UNSPLASH_ACCESS_KEY / PEXELS_API_KEY
docker compose up -d --build
```

Open http://localhost:3000. The `data/` folder (recipes, pantry config, and the SQLite database) is bind-mounted into the container, so weekly plans and ratings persist across container restarts/rebuilds.

To stop it: `docker compose down`. To rebuild after pulling new code: `docker compose up -d --build`.
