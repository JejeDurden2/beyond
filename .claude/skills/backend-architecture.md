# Backend Architecture - NestJS + Hexagonal

## Folder Structure

```
apps/api/src/
├── modules/
│   └── [feature]/
│       ├── domain/
│       │   ├── entities/           # Domain entities
│       │   ├── value-objects/      # Value objects
│       │   ├── events/             # Domain events
│       │   └── repositories/       # Repository interfaces (ports)
│       ├── application/
│       │   ├── use-cases/          # Application services
│       │   ├── ports/              # Input/Output ports
│       │   └── dto/                # Application DTOs
│       ├── infrastructure/
│       │   ├── persistence/        # Prisma repositories (adapters)
│       │   ├── http/               # External API clients
│       │   └── messaging/          # Event publishers
│       └── presentation/
│           ├── controllers/        # HTTP controllers
│           ├── dto/                # Request/Response DTOs
│           └── guards/             # Feature-specific guards
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── pipes/
│   └── utils/
├── config/
│   └── configuration.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── app.module.ts
└── main.ts
```

---

## NestJS Patterns

### Module Structure

```typescript
// feature.module.ts
@Module({
  imports: [PrismaModule],
  controllers: [FeatureController],
  providers: [
    // Use cases
    CreateFeatureUseCase,
    GetFeatureUseCase,
    // Ports → Adapters binding
    {
      provide: FEATURE_REPOSITORY,
      useClass: PrismaFeatureRepository,
    },
  ],
  exports: [FEATURE_REPOSITORY],
})
export class FeatureModule {}
```

### Repository Pattern (Port)

```typescript
// domain/repositories/feature.repository.ts
export const FEATURE_REPOSITORY = Symbol('FEATURE_REPOSITORY');

export interface FeatureRepository {
  findById(id: string): Promise<Feature | null>;
  findAll(filter: FeatureFilter): Promise<Feature[]>;
  save(feature: Feature): Promise<Feature>;
  delete(id: string): Promise<void>;
}
```

### Repository Implementation (Adapter)

```typescript
// infrastructure/persistence/prisma-feature.repository.ts
@Injectable()
export class PrismaFeatureRepository implements FeatureRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Feature | null> {
    const data = await this.prisma.feature.findUnique({ where: { id } });
    return data ? FeatureMapper.toDomain(data) : null;
  }
}
```

### Use Case Pattern

```typescript
// application/use-cases/create-feature.use-case.ts
@Injectable()
export class CreateFeatureUseCase {
  constructor(
    @Inject(FEATURE_REPOSITORY)
    private readonly featureRepository: FeatureRepository,
  ) {}

  async execute(dto: CreateFeatureDto): Promise<Result<Feature, FeatureError>> {
    const feature = Feature.create(dto);
    if (feature.isErr()) return feature;

    await this.featureRepository.save(feature.value);
    return Result.ok(feature.value);
  }
}
```

### Result Pattern (Error Handling)

```typescript
// common/utils/result.ts
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export const Result = {
  ok: <T>(value: T): Result<T, never> => ({ ok: true, value }),
  err: <E>(error: E): Result<never, E> => ({ ok: false, error }),
};
```

### Controller Pattern

```typescript
@Controller('features')
@ApiTags('Features')
export class FeatureController {
  constructor(private readonly createFeature: CreateFeatureUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Create a feature' })
  async create(@Body() dto: CreateFeatureRequestDto): Promise<FeatureResponseDto> {
    const result = await this.createFeature.execute(dto);
    if (!result.ok) throw new BadRequestException(result.error);
    return FeatureMapper.toResponse(result.value);
  }
}
```

---

## Global Configuration

### Interceptors & Filters

```typescript
// main.ts
app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
);
app.useGlobalInterceptors(new LoggingInterceptor());
app.useGlobalFilters(new AllExceptionsFilter());
```

---

## Key Rules

1. **Domain layer has zero imports from infrastructure**
2. **Use cases return `Result<T, E>`, not throwing exceptions**
3. **Controllers only orchestrate, no business logic**
4. **Use dependency injection for all services**
5. **Repository interfaces (ports) live in domain/, implementations (adapters) in infrastructure/**
