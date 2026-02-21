# URL Shortener Backend System (Cloud Native)

A production-grade, cloud-native URL shortener backend built with Node.js and TypeScript, designed to learn and demonstrate modern backend engineering practices including containerization, orchestration, monitoring, and scalable architecture.

## 🎯 Project Goal

Build a **deployable, production-ready URL shortener** that evolves from a simple monolith to a distributed, cloud-native system. This project serves as a practical learning path for:

- In-depth Backend engineering
- Testing and other production-grade practices
- CI/CD Automation pipeline
- Cloud-native architecture patterns
- Container orchestration (Docker → Kubernetes)
- Infrastructure as Code
- Observability & monitoring
- System design & scalability
- Proper Git Workflow
- SDLC (Software Development Lifecycle)

---

## 🛠️ Current Tech Stack

| Category | Technology |
|----------|-----------|
| Language | TypeScript |
| Runtime | Node.js |
| Framework | Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Containerization | Docker |

---

## ✅ V1: Basic Deployable Version (Current Target)

### Features to Implement:

- [x] **Project setup** (Express, TypeScript)
- [x] **Prisma setup**
  - Prisma Initialization
  - Database migration
  - Prisma client generation
- [ ] **Short Code Generator Utility**
  - Random alphanumeric generation (6-7 chars)
  - Collision detection & retry logic
- [ ] **URL Shortening API**
  - `POST /api/shorten` - Create short URL
  - URL validation
  - Unique short code generation
  - Store mapping in PostgreSQL
- [ ] **Redirect Service**
  - `GET /:shortCode` - Redirect to original URL
  - 302 temporary redirect
  - 404 handling for invalid codes
- [x] **Health Check Endpoint**
  - `GET /health` - API health status
- [ ] **Database Schema**
  - `urls` table (id, short_code, original_url, created_at)
  - Proper indexing on short_code
- [x] **PostgreSQL Docker Setup**
  - `docker-compose.yml` for local development
  - PostgreSQL container setup
- [ ] **Express Server Docker Setup**
  - `Dokerfile` for express server
  - `docker-compose.yml` for local development
  - Express server container setup 
- [ ] **Basic Error Handling**
  - Input validation
  - Database error handling
  - Graceful error responses

### Success Criteria:

✅ Can shorten a URL via API  
✅ Can access short URL and get redirected  
✅ Runs in Docker containers locally  
✅ PostgreSQL properly configured with Prisma  
✅ No crashes on invalid input  

---

## 🏗️ Architecture Overview

### V1:Basic Monolith
```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────┐
│  Express.js API Server      │
│  ┌──────────────────────┐   │
│  │ POST /api/shorten    │   │
│  │ GET  /:shortCode     │   │
│  └──────────────────────┘   │
└──────┬──────────────────────┘
       │
       ↓
┌─────────────────────────────┐
│  PostgreSQL                 │
│  ┌──────────────────────┐   │
│  │ urls table:          │   │
│  │ - id                 │   │
│  │ - short_code         │   │
│  │ - original_url       │   │
│  │ - created_at         │   │
│  └──────────────────────┘   │
└─────────────────────────────┘
```
---
## 📁 Project Structure (V1)
```
url-shortener/
├── src/
│   ├── server.ts              # Entry point
│   ├── routes/
│   │   └── url.routes.ts     # API routes
│   ├── controllers/
│   │   └── url.controller.ts # Request handlers
│   ├── services/
│   │   └── url.service.ts    # Business logic
│   ├── repositories/
│   │   └── url.repository.ts # Database interaction logic
│   ├── utils/
│   │   └── shortcode.ts      # Code generation utility
│   └── types/
│       └── index.ts          # TypeScript types
├── prisma/
│   └── schema.prisma         # Database schema
├── docker-compose.yml        # Local dev environment
├── Dockerfile                # Container image
├── .env.example              # Environment template
├── .gitignore
├── .dockerignore
├── package-lock.json
├── package.json
├── prisma.config.ts
├── tsconfig.json
└── README.md
```

---

## 🚀 How to Run (V1)

### Prerequisites:
- Node.js 18+ 
- Docker & Docker Compose
- Git

### Setup:
```bash
# Clone repository
git clone <your-repo-url>
cd url-shortener

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your config

# Start PostgreSQL
docker-compose up -d

# Run database migrations
npm run prisma:migrate

# Generate Prisma client
npm run prisma:generate

# Start development server
npm run dev
```

### Test:
```bash
# Create short URL
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.google.com"}'

# Visit the short URL
curl -L http://localhost:3000/<short-code>
```

---

## 🗺️ Roadmap (Future Versions)

### V2: Performance & Caching
- [ ] Redis caching layer
- [ ] Cache hit/miss metrics
- [ ] Optimized database queries

### V3: Analytics & Tracking
- [ ] Click tracking
- [ ] Basic analytics (total clicks, timestamps)
- [ ] IP & user-agent logging

### V4: Authentication & Authorization
- [ ] User registration/login (JWT)
- [ ] User-specific URL management
- [ ] API key authentication

### V5: Advanced Features
- [ ] Custom short codes (aliases)
- [ ] URL expiration
- [ ] QR code generation
- [ ] Rate limiting per user

### V6: Observability
- [ ] Structured logging
- [ ] Prometheus metrics
- [ ] Health checks (liveness/readiness)
- [ ] Error tracking

### V7: Kubernetes & Cloud Deployment
- [ ] Kubernetes manifests
- [ ] Horizontal Pod Autoscaling
- [ ] Helm charts
- [ ] Cloud deployment (AWS/GCP/Azure)

### V8: Advanced Scaling
- [ ] Multi-instance deployment
- [ ] Load balancer (Nginx)
- [ ] Database replication
- [ ] CDN integration

---

## 📊 Database Schema (V1)
```prisma
model Url {
  id          Int      @id @default(autoincrement())
  shortCode   String   @unique @db.VarChar(10)
  originalUrl String   @db.Text
  createdAt   DateTime @default(now())
  
  @@index([shortCode])
}
```

---

## 🧪 Testing (Planned)

- [ ] Unit tests (Jest)
- [ ] Integration tests
- [ ] Load testing (k6/Apache Bench)
- [ ] CI/CD pipeline (GitHub Actions)

---

## 📚 Learning Outcomes

By completing this project, you will learn:

- **Backend engineering**: REST API design, routing, middleware, security, system architecture, deployment, scaling, etc 
- **Database Design**: Schema design, indexing, ORM usage
- **TypeScript**: Type safety, interfaces, strict typing
- **Containerization**: Docker, multi-stage builds, docker-compose
- **Cloud Native**: 12-factor app principles, stateless design
- **DevOps**: CI/CD, deployment strategies, monitoring
- **Testing**: Unit testing, integration testing and E2E testing
- **SDLC**: Plan -> Code -> Build -> Test -> Release -> Deploy -> Operate -> Monitor
- **Git/GitHub Workflow**: branching, release branch, feature branches, Pull Request, GitHub Actions 

---

## 📝 Development Notes

### Why These Choices?

**Express over NestJS (V1):**
- Simpler for initial version
- Less boilerplate
- Faster to iterate
- Can migrate to NestJS in V4+ for better structure

**Prisma over Raw SQL:**
- Type-safe queries
- Easy migrations
- Good developer experience
- Auto-completion in IDE

**PostgreSQL over MongoDB:**
- ACID compliance needed
- Relational data (future: users, analytics)
- Better for learning SQL optimization

---

## 📚 Documentation

- [Project Setup Guide](./docs/project-setup.md)
- [Prisma Setup Guide](./docs/prisma-setup.md)

## 🤝 Contributing

This is a learning project, but feedback and suggestions are welcome!

---

**Status:** 🚧 Work in Progress - Building V1  
**Last Updated:** 2/20/2026