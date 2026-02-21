# Prisma Setup Guide

**Prisma + PostgreSQL Minimal Production-Ready Setup Guide**

---

## 1️⃣ Install Packages

> Install runtime dependencies

```powershell
npm install @prisma/client@latest
```

> Install developer dependencies

```powershell
npm install -D prisma@latest
```

---

## 2️⃣ Initialize Prisma

> Initialize prisma with datasource provider

```powershell 
npx prisma init --datasource-provider postgresql
```

Update `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model Url {
  
  id          Int      @id @default(autoincrement())
  shortCode   String   @unique @db.VarChar(10)
  originalUrl String   @db.Text
  createdAt   DateTime @default(now())

  @@index([shortCode])

}
```

Update `.env`:

```
DATABASE_URL="postgresql://user:password@localhost:5432/my-db?schema=public"
```

Update `package.json`:

> Update `"scripts"` in `package.json`

```json
{
    // existing code
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "prisma:migrate": "npx prisma migrate dev",
    "prisma:generate": "npx prisma generate",
    "prisma:studio": "npx prisma studio"
  },
    // existing code
}
```

Update `prisma.config.ts`

```ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
```

---

## 3️⃣ Run migrations

```powershell
npm run prisma:migrate
```

> Prisma will prompt you to enter a migration name.

```powershell
√ Enter a name for the new migration: ... init_url_model # give this name or whatever you want
```

---

## 4️⃣ Generate Prisma Client

```powershell
npm run prisma:generate
```

> It will generate prisma client in `src` folder:

```
url-shortener/
├── src/
│   ├── generated/
│   │   └── prisma/  
```

## 5️⃣ Open Prisma Studio

```powershell
npm run prisma:studio
```