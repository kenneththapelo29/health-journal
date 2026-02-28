# Health Journal - Backend Tools Architecture Flowchart

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    NEXT.JS FRAMEWORK (v16.1.6)                         │
│                   Full-Stack TypeScript Framework                       │
│            Handles: API Routes, Server-Side Rendering, SSR             │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
        ┌──────────────────────────────────────────────────────────┐
        │                  API ROUTES LAYER                        │
        │  /api/auth/login  /api/auth/register  /api/auth/logout   │
        └──────────────────────────────────────────────────────────┘
                                    ↓
        ┌─────────────────────────────────────────────────────────┐
        │            MIDDLEWARE & AUTHENTICATION                  │
        │  • Token Verification (JWT)                             │
        │  • Protected Path Validation                            │
        │  • User Context Injection (Headers)                     │
        └─────────────────────────────────────────────────────────┘
         ↙              ↓              ↓              ↓             ↘
        ┌────────┐  ┌────────┐   ┌──────────┐  ┌──────────┐  ┌──────────┐
        │ JWT    │  │ Bcrypt │   │ Prisma   │  │ PG Adapter│ │ Node-PG  │
        │(Token) │  │(Hash)  │   │(ORM)     │  │(Driver)  │  │(Pool)    │
        └────────┘  └────────┘   └──────────┘  └──────────┘  └──────────┘
             │           │            │             │             │
             └─────────────────────────────────────────────────────┘
                                    ↓
        ┌─────────────────────────────────────────────────────────┐
        │           POSTGRESQL DATABASE (pg:5432)                 │
        │  • User Credentials Storage                             │
        │  • Health Journal Entries                               │
        │  • Authentication Sessions                              │
        └─────────────────────────────────────────────────────────┘
```

---

## Backend Tools Breakdown

### 🔐 **Authentication & Security Layer**

| Tool | Version | Purpose | Dependencies |
|------|---------|---------|--------------|
| **jsonwebtoken** | 9.0.3 | JWT token generation & verification | - |
| **bcryptjs** | 3.0.3 | Password hashing & comparison (salt rounds: 10) | - |
| **@types/jsonwebtoken** | 9.0.10 | TypeScript types for JWT | jsonwebtoken |
| **@types/bcryptjs** | 2.4.6 | TypeScript types for bcryptjs | bcryptjs |

**Flow:**
```
User Registration/Login 
  ↓
Bcryptjs: Hash password (10 salt rounds)
  ↓
Store in PostgreSQL
  ↓
JWT: Generate token with userId & email
  ↓
Set secure HTTPOnly cookie
```

---

### 🗄️ **Database & ORM Layer**

| Tool | Version | Purpose | Usage |
|------|---------|---------|-------|
| **@prisma/client** | 7.4.0 | Database ORM & query builder | Query construction & execution |
| **@prisma/adapter-pg** | 7.4.0 | PostgreSQL driver adapter for Prisma | Bridges Prisma → PostgreSQL |
| **prisma** | 7.4.0 | CLI & schema management | Migrations, schema generation |
| **pg** | 8.18.0 | Native PostgreSQL client | Connection pooling (direct) |
| **@types/pg** | 8.16.0 | TypeScript types for pg | Type safety |

**Connection Stack:**
```
Prisma Client 
  ↓
@prisma/adapter-pg 
  ↓
pg (Node PostgreSQL) - Connection Pool
  ↓
PostgreSQL Database
```

---

### 🛠️ **Development & Tooling**

| Tool | Version | Purpose |
|------|---------|---------|
| **typescript** | 5.x | TypeScript compiler & language |
| **eslint** | 9.x | Code linting & quality |
| **eslint-config-next** | 16.1.6 | Next.js ESLint configuration |
| **@types/node** | 20.x | Node.js type definitions |
| **@types/react** | 19.x | React type definitions |
| **@types/react-dom** | 19.x | React DOM type definitions |

---

### 📋 **Additional Libraries (Utility Functions)**

| Module | Purpose | Location |
|--------|---------|----------|
| **lib/auth.ts** | Auth utilities (hash, compare, JWT) | Core authentication logic |
| **lib/prisma.ts** | Prisma singleton instance | Global database client |
| **lib/rate-limit.ts** | Rate limiting protection | API protection |
| **lib/validator.ts** | Input validation | Data validation |
| **middleware.ts** | Next.js middleware | Request interceptor |

---

## Data Flow Architecture

```
CLIENT REQUEST
    ↓
Next.js API Route Handler
    ↓
Middleware Verification (JWT Token)
    ↓
Auth Library (bcryptjs/jwt operations)
    ↓
Prisma ORM Query Builder
    ↓
@prisma/adapter-pg (Protocol Translation)
    ↓
Node-pg Driver (Connection Pool)
    ↓
PostgreSQL Database Server
    ↓
Response → Middleware → Encryption/Security → Client
```

---

## Environment Variables Used

```
DATABASE_URL     → PostgreSQL connection string (used by Prisma & pg)
JWT_SECRET       → Secret key for JWT signing/verification
NODE_ENV         → Development/Production mode (affects logging & security)
```

---

## Key Backend Integrations

### 1️⃣ **Authentication Flow**
- Register: Email + Password → Bcrypt Hash → Prisma Store → JWT Token
- Login: Email + Password → Bcrypt Compare → JWT Generate → Cookie Set
- Verify: Token → JWT Verify → Middleware Check → Access Granted/Denied

### 2️⃣ **Database Operations**
- Prisma handles schema-based queries
- PostgreSQL adapter ensures connection efficiency
- Connection pooling via node-pg (prevents resource exhaustion)

### 3️⃣ **Security Layer**
- HTTPOnly cookies prevent XSS attacks
- JWT expiration (7 days)
- Bcrypt with 10 salt rounds for password strength
- Middleware-based token validation on protected routes

---

## Dependency Tree

```
Next.js 16.1.6 (Framework)
    ├── React 19.2.3 (UI)
    ├── TypeScript 5.x (Language)
    └── Backend Stack
        ├── Authentication
        │   ├── jsonwebtoken 9.0.3
        │   └── bcryptjs 3.0.3
        └── Database
            ├── Prisma 7.4.0
            │   ├── @prisma/client 7.4.0
            │   └── @prisma/adapter-pg 7.4.0
            └── PostgreSQL Driver
                ├── pg 8.18.0
                └── Connection Pool
```

---

## Performance Considerations

| Tool | Performance Strategy |
|------|---------------------|
| **Prisma** | Lazy loading, relation optimization |
| **pg (Node)** | Connection pooling to reduce overhead |
| **JWT** | Stateless authentication (no DB lookup per request) |
| **Bcrypt** | 10 salt rounds (balanced security/speed) |

---

*Generated: Backend Architecture for Health Journal Application*
