# climb.lol

## Local development checklist

**Required environment variables**

- `DATABASE_URL` (example: `file:./dev.db`)
- `NEXTAUTH_URL` (example: `http://localhost:3000`)
- `NEXTAUTH_SECRET` (generate a random string)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (optional for OAuth sign-in)
- `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` (optional for OAuth sign-in)

**Commands**

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```
