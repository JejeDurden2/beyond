# Claude.md - Project Guidelines

## Stack

**Frontend:** React 19, TypeScript 5+, Tailwind CSS, shadcn/ui, Vercel
**Backend:** NestJS, Prisma, PostgreSQL (Neon in production), Railway
**Storage:** Cloudflare R2 (encrypted blobs)
**Architecture:** DDD, Hexagonal Architecture, Monorepo (Turborepo)

---

## Monorepo Structure

```
/
├── apps/
│   ├── web/                 # React frontend
│   └── api/                 # NestJS backend
├── packages/
│   ├── ui/                  # Shared shadcn components
│   ├── config/              # ESLint, TSConfig, Tailwind
│   ├── types/               # Shared TypeScript types
│   └── utils/               # Shared utilities
├── turbo.json
└── package.json
```

---

## Backend - Architecture Hexagonale

```
apps/api/src/
├── modules/
│   └── [domain]/
│       ├── domain/
│       │   ├── entities/        # Business objects
│       │   ├── value-objects/   # Immutables (Email, Money...)
│       │   ├── repositories/    # Interfaces (ports)
│       │   └── services/        # Domain services
│       ├── application/
│       │   ├── commands/        # Use cases write (CQRS)
│       │   ├── queries/         # Use cases read
│       │   └── ports/           # Secondary ports (external services)
│       └── infrastructure/
│           ├── adapters/        # Implementations (Prisma, APIs)
│           ├── controllers/     # HTTP adapters (primary)
│           └── mappers/         # Entity <-> Persistence
├── shared/
│   ├── domain/                  # Base classes (AggregateRoot, Entity)
│   └── infrastructure/          # Guards, filters, interceptors
└── main.ts
```

### Principes DDD

- **Entities:** Identité unique, cycle de vie, comparaison par ID
- **Value Objects:** Immutables, comparaison par valeur, auto-validation
- **Aggregates:** Frontière de consistance, accès via root uniquement
- **Repository pattern:** Interface dans domain/, implémentation dans infrastructure/

### NestJS + Hexagonal

```typescript
// domain/repositories/user.repository.ts (PORT)
export interface UserRepository {
  findById(id: UserId): Promise<User | null>;
  save(user: User): Promise<void>;
}

// infrastructure/adapters/prisma-user.repository.ts (ADAPTER)
@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaService) {}
  // ...
}

// Module binding
providers: [
  { provide: 'UserRepository', useClass: PrismaUserRepository }
]
```

---

## Frontend - Conventions

### Structure

```
apps/web/src/
├── app/                    # Routes (App Router)
├── components/
│   ├── ui/                 # shadcn (importés depuis packages/ui)
│   └── features/           # Components métier
├── hooks/
├── lib/
│   ├── api/                # API client (fetch/axios)
│   └── utils/
├── stores/                 # Zustand si nécessaire
└── types/
```

### Conventions React

- **Components:** PascalCase, un component par fichier
- **Hooks:** Préfixe `use`, logique réutilisable uniquement
- **Server Components par défaut**, `"use client"` uniquement si nécessaire
- **Colocation:** Tests et styles au plus proche du component

### shadcn/ui + Design sobre

```typescript
// tailwind.config.ts - Palette sobre et solennelle
const config = {
  theme: {
    extend: {
      colors: {
        background: "hsl(0 0% 100%)",      // Blanc pur
        foreground: "hsl(222 47% 11%)",    // Slate-900
        muted: "hsl(210 40% 96%)",
        accent: "hsl(215 20% 65%)",        // Bleu-gris sobre
        border: "hsl(214 32% 91%)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
};
```

- Espacement généreux, peu d'effets visuels
- Typographie claire, hiérarchie marquée
- Animations subtiles (`duration-200`, `ease-out`)
- Pas de couleurs saturées, privilégier les neutres

---

## Tests

### Stratégie

| Type | Outil | Cible | Couverture |
|------|-------|-------|------------|
| Unit | Vitest | Domain, Utils | 80%+ |
| Integration | Vitest + Supertest | Use cases, API | 70%+ |
| E2E | Playwright | User flows critiques | Smoke tests |

### Backend - Tests unitaires domain

```typescript
// user.entity.spec.ts
describe('User', () => {
  it('should create valid user', () => {
    const user = User.create({ email: Email.create('test@example.com') });
    expect(user.isOk()).toBe(true);
  });

  it('should reject invalid email', () => {
    const email = Email.create('invalid');
    expect(email.isErr()).toBe(true);
  });
});
```

### Frontend - Tests components

```typescript
// feature.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('LoginForm', () => {
  it('should submit valid credentials', async () => {
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);
    
    await userEvent.type(screen.getByLabelText(/email/i), 'test@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));
    
    expect(onSubmit).toHaveBeenCalledWith({ email: 'test@test.com', password: 'password123' });
  });
});
```

### E2E - Playwright

```typescript
// auth.e2e.ts
test('user can login and access dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'user@test.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
});
```

### Scripts Turborepo

```json
{
  "scripts": {
    "test": "turbo run test",
    "test:e2e": "turbo run test:e2e",
    "test:coverage": "turbo run test -- --coverage"
  }
}
```

---

## Privacy by Design

### Principes RGPD intégrés

1. **Minimisation des données:** Ne collecter que le nécessaire
2. **Pseudonymisation:** IDs opaques (UUID v4), pas d'emails dans les logs
3. **Chiffrement:** At-rest (PostgreSQL TDE), in-transit (TLS 1.3)
4. **Retention:** Politique de suppression automatique
5. **Consentement:** Explicite, granulaire, révocable

### Implémentation backend

```typescript
// shared/decorators/personal-data.decorator.ts
export const PersonalData = (category: 'identity' | 'contact' | 'sensitive') => 
  SetMetadata('personalData', category);

// domain/entities/user.entity.ts
export class User extends AggregateRoot {
  @PersonalData('identity')
  private readonly email: Email;
  
  @PersonalData('contact')
  private readonly phone?: Phone;
}

// infrastructure/interceptors/audit-log.interceptor.ts
// Log les accès aux données personnelles sans les exposer
```

### Prisma - Soft delete & anonymisation

```prisma
model User {
  id          String    @id @default(uuid())
  email       String    @unique
  deletedAt   DateTime?
  anonymizedAt DateTime?
  
  @@index([deletedAt])
}
```

```typescript
// Anonymisation au lieu de suppression
async anonymize(userId: string): Promise<void> {
  await this.prisma.user.update({
    where: { id: userId },
    data: {
      email: `anonymized-${userId}@deleted.local`,
      phone: null,
      anonymizedAt: new Date(),
    },
  });
}
```

### Frontend - Consentement

```typescript
// hooks/use-consent.ts
export function useConsent() {
  const [consent, setConsent] = useState<ConsentState | null>(null);

  const grantConsent = (purposes: ConsentPurpose[]) => {
    const state = { purposes, grantedAt: new Date().toISOString() };
    // Stockage local + sync API
  };

  const revokeConsent = (purpose: ConsentPurpose) => { /* ... */ };
  
  return { consent, grantConsent, revokeConsent };
}
```

---

## CI/CD

```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm format:check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm db:generate
      - run: pnpm test

  build:
    needs: [lint, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm db:generate
      - run: pnpm build

  e2e:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps
      - run: pnpm test:e2e
```

---

## Database

### Development (Docker)
```bash
docker compose up -d           # Start PostgreSQL on port 5433
pnpm db:generate              # Generate Prisma client
pnpm db:push                  # Push schema to database
pnpm db:studio                # Open Prisma Studio
```

### Production (Neon)
- Serverless PostgreSQL with autoscaling
- Connection pooling via PgBouncer
- Branching for preview environments

```env
# Production DATABASE_URL format
DATABASE_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/beyond?sslmode=require"
```

---

## Linting & Formatting

### ESLint
- Shared configs in `packages/config/eslint/`
- `base.js` - TypeScript base rules
- `react.js` - React + JSX accessibility
- `nestjs.js` - NestJS backend rules

### Prettier
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

### Scripts
```bash
pnpm lint          # Run ESLint on all packages
pnpm format        # Format all files with Prettier
pnpm format:check  # Check formatting (CI)
```

---

## Conventions de code

### TypeScript

- `strict: true` obligatoire
- Éviter `any`, préférer `unknown` + type guards
- Result pattern pour les erreurs métier (neverthrow)

### Commits

```
feat(domain): add user registration use case
fix(api): handle duplicate email error
test(web): add login form tests
```

### PR Checklist

- [ ] Tests unitaires ajoutés/mis à jour
- [ ] Tests E2E si flow utilisateur impacté
- [ ] Pas de données personnelles dans les logs
- [ ] Types stricts, pas de `any`
- [ ] Documentation mise à jour si API publique
