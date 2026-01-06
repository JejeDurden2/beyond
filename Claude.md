# Claude.md - Project Guidelines

## Stack

**Frontend:** React 19, TypeScript 5+, Tailwind CSS, shadcn/ui, Vercel
**Backend:** NestJS, Prisma, PostgreSQL (Neon in production), Railway
**Storage:** Cloudflare R2 (encrypted blobs)
**Architecture:** DDD, Hexagonal Architecture, Monorepo (Turborepo)

---

## Skills (Detailed Documentation)

Extended documentation is available in `.claude/skills/`:

- **[design-system.md](.claude/skills/design-system.md)** - Complete design system with colors, typography, components

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
├── .claude/
│   └── skills/              # Detailed Claude guidelines
├── turbo.json
└── package.json
```

---

## Backend - Hexagonal Architecture

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

### DDD Principles

- **Entities:** Unique identity, lifecycle, comparison by ID
- **Value Objects:** Immutable, comparison by value, self-validating
- **Aggregates:** Consistency boundary, access via root only
- **Repository pattern:** Interface in domain/, implementation in infrastructure/

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
providers: [{ provide: 'UserRepository', useClass: PrismaUserRepository }];
```

---

## Frontend - Conventions

### Structure

```
apps/web/src/
├── app/                    # Routes (App Router)
├── components/
│   ├── ui/                 # shadcn (imported from packages/ui)
│   └── features/           # Business components
├── hooks/
├── lib/
│   ├── api/                # API client (fetch/axios)
│   └── utils/
├── stores/                 # Zustand if needed
└── types/
```

### React Conventions

- **Components:** PascalCase, one component per file
- **Hooks:** `use` prefix, reusable logic only
- **Server Components by default**, `"use client"` only when necessary
- **Colocation:** Tests and styles close to component

### Design System (Summary)

See `.claude/skills/design-system.md` for complete documentation.

**Key points:**

- Premium, private-banking aesthetic
- Fraunces (serif) for headings, Inter for body
- Warm off-white background, deep charcoal text, muted gold accent
- Soft shadows (`shadow-soft`, `shadow-soft-md`)
- All transitions: `duration-200 ease-out`

---

## Tests

### Strategy

| Type        | Tool               | Target              | Coverage    |
| ----------- | ------------------ | ------------------- | ----------- |
| Unit        | Vitest             | Domain, Utils       | 80%+        |
| Integration | Vitest + Supertest | Use cases, API      | 70%+        |
| E2E         | Playwright         | Critical user flows | Smoke tests |

### Backend - Domain Unit Tests

```typescript
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

### Frontend - Component Tests

```typescript
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

### Scripts

```bash
pnpm test          # Run all tests
pnpm test:e2e      # Run E2E tests
pnpm test:coverage # Run with coverage
```

---

## Privacy by Design

### GDPR Principles

1. **Data minimization:** Collect only what's necessary
2. **Pseudonymization:** Opaque IDs (UUID v4), no emails in logs
3. **Encryption:** At-rest (PostgreSQL TDE), in-transit (TLS 1.3)
4. **Retention:** Automatic deletion policy
5. **Consent:** Explicit, granular, revocable

### Prisma - Soft Delete & Anonymization

```prisma
model User {
  id           String    @id @default(uuid())
  email        String    @unique
  deletedAt    DateTime?
  anonymizedAt DateTime?

  @@index([deletedAt])
}
```

---

## Database

### Development (Docker)

```bash
docker compose up -d    # Start PostgreSQL on port 5433
pnpm db:generate        # Generate Prisma client
pnpm db:push            # Push schema to database
pnpm db:studio          # Open Prisma Studio
```

### Production (Neon)

- Serverless PostgreSQL with autoscaling
- Connection pooling via PgBouncer
- Branching for preview environments

---

## Git & Conventional Commits

### Commit Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type       | Description                                             |
| ---------- | ------------------------------------------------------- |
| `feat`     | New feature                                             |
| `fix`      | Bug fix                                                 |
| `docs`     | Documentation only                                      |
| `style`    | Formatting, no code change                              |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf`     | Performance improvement                                 |
| `test`     | Adding or updating tests                                |
| `build`    | Build system or dependencies                            |
| `ci`       | CI configuration                                        |
| `chore`    | Other changes (tooling, etc.)                           |

### Scopes

| Scope         | Description             |
| ------------- | ----------------------- |
| `api`         | Backend NestJS app      |
| `web`         | Frontend Next.js app    |
| `ui`          | Shared UI package       |
| `auth`        | Authentication module   |
| `vault`       | Vault module            |
| `keepsake`    | Keepsake module         |
| `beneficiary` | Beneficiary module      |
| `db`          | Database/Prisma changes |
| `config`      | Configuration changes   |
| `deps`        | Dependencies            |

### Examples

```bash
feat(keepsake): add encrypted content support
fix(api): handle duplicate email registration error
refactor(auth): rename legacy-item to keepsake
style(web): update landing page with premium design
test(vault): add encryption salt validation tests
docs: add setup instructions
build(deps): upgrade prisma to 6.19
ci: add e2e tests to pipeline
```

### Breaking Changes

Add `!` after type/scope and explain in footer:

```
feat(api)!: change keepsake API response format

BREAKING CHANGE: The keepsakes endpoint now returns `keepsakes` instead of `items`
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

## Code Conventions

### TypeScript

- `strict: true` required
- Avoid `any`, prefer `unknown` + type guards
- Result pattern for business errors (neverthrow)

### PR Checklist

- [ ] Unit tests added/updated
- [ ] E2E tests if user flow impacted
- [ ] No personal data in logs
- [ ] Strict types, no `any`
- [ ] Documentation updated if public API

---

## Pre-Commit Code Review

Before committing, always perform a self-review:

1. **Lint & Format**: Run `pnpm lint && pnpm format:check`
2. **Type Check**: Ensure no TypeScript errors with `pnpm build`
3. **Test**: Run `pnpm test` for affected packages
4. **Security**: Check for exposed secrets, XSS vulnerabilities, SQL injection
5. **Performance**: Verify no unnecessary re-renders, large bundles, or N+1 queries
6. **Accessibility**: Ensure proper labels, roles, keyboard navigation
7. **i18n**: Verify all user-facing strings are translated in both `fr.json` and `en.json`
8. **SEO**: For public pages, ensure metadata is set with `generateMetadata()`

### Automated Checks

```bash
# Run all checks before commit
pnpm lint && pnpm format:check && pnpm test && pnpm build
```

### Manual Review Points

- No `console.log` in production code (use NestJS Logger on backend)
- No hardcoded URLs or secrets
- Error boundaries for client components
- Loading states for async operations
- Proper error handling with user-friendly messages
