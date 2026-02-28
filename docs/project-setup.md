# Project Setup Guide

**Express + TypeScript (ESM) Minimal Production-Ready Setup**

---

## 1️⃣ Create Project

```bash
mkdir url-shortener
cd url-shortener
npm init -y
```

---

## 2️⃣ Install Dependencies

### Runtime Dependencies

```bash
npm install express dotenv
```

### Dev Dependencies

```bash
npm install -D typescript tsx @types/node @types/express
```

> `tsx` → run TypeScript directly in development
> 
> `typescript` → compile TS → JS for production

---

## 3️⃣ Initialize TypeScript

```bash
npx tsc --init
```

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 4️⃣ Project Structure

```
url-shortener/
├── src/
│   └── server.ts
├── .env
├── .env.example
├── .gitignore
├── tsconfig.json
├── package-lock.json
└── package.json
```

---

## 5️⃣ Create `server.ts`

```ts
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.get("/", (_req, res) => {
  res.status(200).json({
    message: "Server is up and running",
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
```

---

## 6️⃣ Update `package.json`

Add:

```json
{
  "type": "module",
  "main": "dist/server.js",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

> `dev` → development mode
> 
> `build` → compile TypeScript
> 
> `start` → run compiled JS (production)

---

## 7️⃣ Environment Configuration

### `.env`

```
PORT=5000
NODE_ENV=development
BASE_URL=http://localhost:5000
```

### `.env.example` (recommended for public repos)

```
PORT=
NODE_ENV=
BASE_URL=
```

---

## 8️⃣ Create `.gitignore`

```gitignore
# Dependencies
node_modules/

# Build output
dist/

# Environment files
.env
.env.*
!.env.example

# Logs
*.log

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```

> Keep it minimal. Don’t over-engineer ignore rules early.

---

## 9️⃣ Run Development Server

```bash
npm run dev
```

Visit:

```
http://localhost:5000
```

---

# ✅ What This Setup Gives You

* Type-safe Express server
* ESM support
* Clean build separation (src → dist)
* Proper environment handling
* Production-ready script structure

---

