# Local Setup

Run all commands from the repository root:

```powershell
cd F:\acquire360\Acquire-360-Ventures-Website\Acquire-360-Ventures-Website
pnpm run setup
pnpm run dev
```

The API reads environment variables from:

```text
artifacts/api-server/.env
```

Useful root scripts:

```powershell
pnpm run dev       # start API on 5000 and web on 5173
pnpm run dev:api   # start only the API
pnpm run dev:web   # start only the frontend
pnpm run db:push   # push Drizzle schema to the configured database
pnpm run seed      # seed initial content and admin user
pnpm run setup     # install dependencies, push schema, seed data
```

Open the website at:

```text
http://localhost:5173
```

The API health endpoint is:

```text
http://localhost:5000/api/health
```
