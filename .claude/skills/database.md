# Database - Prisma & Docker

## Strategy

- **Local**: PostgreSQL in Docker for local dev
- **Production**: Neon (PostgreSQL)

---

## Prisma Configuration

### Schema Structure

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // For Neon pooling
}

// Base fields mixin pattern (use in all models)
// id, createdAt, updatedAt

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("users")
}
```

### Prisma Service

```typescript
// prisma/prisma.service.ts
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Soft delete extension, transactions, etc.
}
```

### Migration Commands

```bash
pnpm prisma migrate dev --name init    # Create migration
pnpm prisma migrate deploy             # Apply in production
pnpm prisma generate                   # Generate client
pnpm prisma db seed                    # Seed data
pnpm prisma studio                     # GUI
```

---

## Docker Compose

### docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: app-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: app_dev
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 5s
      timeout: 5s
      retries: 5

  # Optional: Redis for caching/queues
  redis:
    image: redis:7-alpine
    container_name: app-redis
    restart: unless-stopped
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data

  # Optional: Jaeger for local OpenTelemetry
  jaeger:
    image: jaegertracing/all-in-one:1.53
    container_name: app-jaeger
    restart: unless-stopped
    ports:
      - '16686:16686' # UI
      - '4318:4318' # OTLP HTTP
    environment:
      COLLECTOR_OTLP_ENABLED: true

volumes:
  postgres_data:
  redis_data:
```

---

## Environment Files

```env
# apps/api/.env.local (LOCAL - Docker PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app_dev?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/app_dev?schema=public"
OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318"

# apps/api/.env.production (PRODUCTION - Neon)
DATABASE_URL="postgresql://user:pass@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require"
```

---

## Commands

```bash
# Start local services
docker compose up -d

# Stop
docker compose down

# Reset database (careful!)
docker compose down -v && docker compose up -d

# Logs
docker compose logs -f postgres
```

### Prisma Workflow

```bash
# Local development
pnpm db:migrate          # Applies migrations to local Docker DB

# Production (CI/CD or manual)
DATABASE_URL=$NEON_URL pnpm prisma migrate deploy
```

---

## Key Rules

1. **Use docker-compose for local dev, Neon for production**
2. **Always use `@map` for snake_case columns in Prisma**
3. **Include `createdAt` and `updatedAt` on all models**
4. **Use `cuid()` for IDs**
5. **No N+1 queries — use includes/joins**
