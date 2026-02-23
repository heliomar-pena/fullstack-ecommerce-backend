# CHANGELOG: NestJS E-Commerce Refactor

This file contains a summary of the main changes made from the original repo to this new repository. Think on it as a continuation of the [initial analysis](./INITIAL_ANALYSIS.md) documentation, but including the solution applied to each problem from the previous analysis.

## Summary

A refactor of the original project was performed, significantly improving **security, scalability, maintainability, and overall architecture**.
The project evolved from a modularized structure to Event Driven Development.

## Table of Content

- [CHANGELOG: NestJS E-Commerce Refactor](#changelog-nestjs-e-commerce-refactor)
  - [Summary](#summary)
  - [Table of Content](#table-of-content)
  - [High Priority Changes](#high-priority-changes)
    - [1. Authentication Security: Routes Protected by Default](#1-authentication-security-routes-protected-by-default)
      - [Original Problem: Routes Public by Default](#original-problem-routes-public-by-default)
      - [Implemented Solution: Routes Protected by Default](#implemented-solution-routes-protected-by-default)
        - [Benefits](#benefits)
    - [2. JWT Tokens: Removal of PII (Personally Identifiable Information)](#2-jwt-tokens-removal-of-pii-personally-identifiable-information)
      - [Original Problem: Email exposed in JWT Token](#original-problem-email-exposed-in-jwt-token)
      - [Implemented Solution: Only user ID saved on token](#implemented-solution-only-user-id-saved-on-token)
      - [Benefits of removing PII information from token](#benefits-of-removing-pii-information-from-token)
    - [3. Dependency Vulnerabilities: Full Upgrade](#3-dependency-vulnerabilities-full-upgrade)
      - [Benefits of updating dependencies](#benefits-of-updating-dependencies)
    - [4. Environment Variables: Proper Configuration Management](#4-environment-variables-proper-configuration-management)
      - [Problems of current .env implementation](#problems-of-current-env-implementation)
      - [Changes on .env implementation](#changes-on-env-implementation)
      - [Benefits of implementing different solution for environment variables](#benefits-of-implementing-different-solution-for-environment-variables)
    - [5. Database Seeds Versioned with Migrations](#5-database-seeds-versioned-with-migrations)
      - [Original Problems](#original-problems)
      - [Implemented Solution](#implemented-solution)
      - [Benefits of having seeds treated as migrations](#benefits-of-having-seeds-treated-as-migrations)
    - [6. Repository Pattern: Persistence Abstraction](#6-repository-pattern-persistence-abstraction)
      - [Original Problem of having services coupled to typeorm](#original-problem-of-having-services-coupled-to-typeorm)
      - [Implemented Solution: Added repository layer](#implemented-solution-added-repository-layer)
      - [Benefits of having repository layer](#benefits-of-having-repository-layer)
  - [Medium Priority Changes](#medium-priority-changes)
    - [7. Domain-Specific Error Handling](#7-domain-specific-error-handling)
      - [Original Problems of having a big list of errors](#original-problems-of-having-a-big-list-of-errors)
      - [Implemented Solution for error list](#implemented-solution-for-error-list)
      - [Benefits of new error instances](#benefits-of-new-error-instances)
    - [8. Testing Infrastructure Improvements](#8-testing-infrastructure-improvements)
      - [Original Problems of current testing](#original-problems-of-current-testing)
      - [Implemented Solution for testing](#implemented-solution-for-testing)
      - [Benefits of new tests infrastructure](#benefits-of-new-tests-infrastructure)
    - [9. Manual Documentation with Postman](#9-manual-documentation-with-postman)
      - [Original Problems with manual documentation](#original-problems-with-manual-documentation)
      - [Implemented Solution -\> Using NestJS swagger integration](#implemented-solution---using-nestjs-swagger-integration)
      - [Benefits of using Swagger for documentation](#benefits-of-using-swagger-for-documentation)
  - [Low Priority Changes](#low-priority-changes)
    - [10. Event-Driven Architecture](#10-event-driven-architecture)
      - [Issues of current architecture](#issues-of-current-architecture)
      - [Implemented Solution -\> Migrated to Event Driven Development](#implemented-solution---migrated-to-event-driven-development)
      - [Benefits of event driven development](#benefits-of-event-driven-development)
    - [11. Dynamic Product Attributes](#11-dynamic-product-attributes)
      - [Problems of original solution (schema defined in code, DB flexible)](#problems-of-original-solution-schema-defined-in-code-db-flexible)
      - [Implemented Solution -\> Adding a table for specificating attributes for category on DB](#implemented-solution---adding-a-table-for-specificating-attributes-for-category-on-db)
      - [Benefits of new DB Driven attributes](#benefits-of-new-db-driven-attributes)
  - [Change Summary](#change-summary)

---

## High Priority Changes

### 1. Authentication Security: Routes Protected by Default

#### Original Problem: Routes Public by Default

```ts
// BEFORE: All routes are public by default
// Forgetting to protect a route leaves it publicly exposed
@Controller('user')
export class UserController {
  @Get('profile')
  profile() { ... }
}
```

#### Implemented Solution: Routes Protected by Default

```ts
// AFTER: All routes are protected by default
// Public routes must be explicitly marked with @Public()

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true; // ✅ Explicit opt-out

    // Validate JWT token...
  }
}

// Registered as global APP_GUARD
@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
```

Public route decorator:

```ts
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

##### Benefits

- Secure-by-default (fail-secure pattern)
- Zero accidentally exposed routes
- Explicit and readable intent

---

### 2. JWT Tokens: Removal of PII (Personally Identifiable Information)

#### Original Problem: Email exposed in JWT Token

```ts
// BEFORE: Email included in JWT payload (PII exposure)
{
  id: user.id,
  email: email, // Sensitive data inside token
}
```

Issues

- Email visible via JWT decode
- Publicly accessible information
- Easier phishing and user targeting

#### Implemented Solution: Only user ID saved on token

```ts
// AFTER: Minimal token payload (ID only)
const payload = { id: user.id };

this.jwtService.sign(payload, {
  subject: user.id.toString(),
  issuer: this.auth.issuer,
});
```

DTO separation

```ts
// Information sent in token
export class JwtPayloadDto {
  id: number;
}

// Request payload (with authenticated user's data)
export class RequestUserDto {
  id: number;
  email: string; // Only In-memory on the server, not in the token
  roles: Role[];
}
```

#### Benefits of removing PII information from token

- Smaller tokens
- No PII exposure
- Improved phishing resistance
- Always up-to-date user data (loaded from DB)

---

### 3. Dependency Vulnerabilities: Full Upgrade

Problem

77 vulnerabilities (9 low, 18 moderate, 47 high, 3 critical) -> Even after `npm audit fix`

Solution

Upgraded the system to the latest version of the libraries

```json
{
  "dependencies": {
    "@nestjs/common": "^11.0.1", // +2 major versions
    "@nestjs/config": "^4.0.3", // Updated
    "@nestjs/core": "^11.0.1", // +2 major versions
    "@nestjs/event-emitter": "^3.0.1", // New
    "@nestjs/jwt": "^11.0.2", // +1 major version
    "@nestjs/swagger": "^11.2.6", // New
    "@nestjs/typeorm": "^11.0.0", // +2 major versions
    "typeorm": "^0.3.28", // Updated
    "pg": "^8.18.0", // Updated
    "bcrypt": "^6.0.0" // +1 major version
  },
  "devDependencies": {
    "@nestjs/cli": "^11.0.0", // +2 major versions
    "@types/jest": "^30.0.0", // +1 major version
    "@types/node": "^22.10.7", // +4 major versions
    "eslint": "^9.18.0", // +1 major version
    "jest": "^29.7.0" // Updated
  }
}
```

#### Benefits of updating dependencies

- Zero reported vulnerabilities
- Long-term maintainability

---

### 4. Environment Variables: Proper Configuration Management

#### Problems of current .env implementation

```json
src/
├── common/
│   └── envs/
│       ├── .env.development
│       └── .env.test
...
// nest-cli.json
{
  "compilerOptions": {
    "assets": ["common/envs/*"]
  }
}
```

- `.env` files bundled with build
- Manual config loading
- No validation
- No type safety

#### Changes on .env implementation

- .env files moved to repository root (.env, .env.development, .env.test)
- @nestjs/config used as the centralized configuration module
- Typed configuration using registerAs
- Fail-fast validation at startup for critical secrets (example: JWT_SECRET)
- Central config module encapsulating envFilePath ordering

Typed config example:

```ts
// src/auth/auth.config.ts
export const authConfig = registerAs('auth', () => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length <= 2)
    throw new Error('JWT_SECRET must be provided.');

  return {
    jwtSecret: process.env.JWT_SECRET,
    issuer: process.env.JWT_ISSUER,
    salt: process.env.HASH_SALT ?? 10,
  };
});
```

Centralized config module:

```ts
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
    }),
    ConfigModule.forFeature(authConfig),
    ConfigModule.forFeature(databaseConfig),
  ],
})
export class AppConfigModule {}
```

#### Benefits of implementing different solution for environment variables

- Secrets are not included in build artifacts
- Configuration is centralized and typed
- Startup fails early when required env vars are missing
- Predictable behavior across environments

---

### 5. Database Seeds Versioned with Migrations

#### Original Problems

```ts
const seeders = [rolesSeeder, adminSeeder, categoriesSeeder];

await Bluebird.each(seeders, async (seeder) => {
  await seeder.seed();
});
```

- No rollback support
- No guaranteed execution order
- Fragile data evolution

#### Implemented Solution

- Seeds treated as migrations.
- Timestamp-based ordering.
- Rollback support via `down()`.
- Enable and disable seeds via .env (for production config).

Example:

```ts
// 1771689090383-initial_roles.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialRoles1771689090383 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'INSERT INTO "role" (id, name) VALUES ($1, $2), ($3, $4), ($5, $6);',
      [1, 'Customer', 2, 'Merchant', 3, 'Admin'],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "role" WHERE role.id IN (1, 2, 3)');
  }
}
```

#### Benefits of having seeds treated as migrations

- Deterministic execution order
- Safe rollbacks
- Clean migration history

---

### 6. Repository Pattern: Persistence Abstraction

#### Original Problem of having services coupled to typeorm

- Does not follows single responsibility principle
- Cross-domain mutations
- Persistence logic mixed with business logic
- Hard to migrate from ORM
- Hard to tests without a DB (requires harder mocks)

```ts
// Services coupled to TypeORM repositories
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async createUser(body: CreateUserDto, ...roles: Role[]) {
    const user = this.repository.create({ ...body, roles });
    return this.repository.save(user);
  }

  async save(user: User) {
    return this.repository.save(user);
  }
}
```

#### Implemented Solution: Added repository layer

- All persistence queries moved into repositories
- Services depend on repositories, not on ORM-specific repositories
- Cross-aggregate writes handled via repository methods (example: relation assignment)
- Modules export repositories instead of services when needed

Repository example:

```ts
@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  findOneWithRoles(id: number) {
    return this.usersRepository.findOne({
      where: { id },
      relations: { roles: true },
    });
  }
}
```

Service stays focused on business rules:

```ts
@Injectable()
export class UserService {
  constructor(private readonly userRepository: UsersRepository) {}

  async findById(id: number) {
    const user = await this.userRepository.findOneWithRoles(id);
    if (!user) throw new UserNotFound();
    return user;
  }

  async assignUserRole(userId: number, roleId: number) {
    await this.userRepository.assignRoleToUser(userId, roleId);
  }
}
```

#### Benefits of having repository layer

- Clear separation between business logic and persistence
- Easier unit testing (mock repositories)
- Reduced coupling to TypeORM
- Cleaner module boundaries and responsibilities

---

## Medium Priority Changes

### 7. Domain-Specific Error Handling

#### Original Problems of having a big list of errors

```jsx
export const errorMessages = {
  auth: {
    wronCredentials: { message: 'Invalid username or password.', code: 401 },
    userAlreadyExist: {
      message: 'User with provided email already exists.',
      code: 409,
    },
  },
};
```

- Difficult to check if there are repeated error codes
- Errors that are not in use anymore (for example if we remove a domain but forgot to remove the error)
- Errors with inconsistent code status (for example, User not found -> HTTP Status 500)

#### Implemented Solution for error list

- Replaced error map with explicit typed error classes
- Each error maps to a specific HTTP exception type
- Stable string code for frontend handling

Examples:

```ts
export class WrongCredentials extends UnauthorizedException {
  constructor() {
    super({
      message: 'Invalid username or password.',
      code: 'invalid_credentials',
    });
  }
}

export class EmailInUse extends ConflictException {
  constructor() {
    super({
      message: 'User with provided email already exists.',
      code: 'user_email_in_use',
    });
  }
}
```

#### Benefits of new error instances

- Type-safe errors
- Consistent error responses
- Easier debugging and maintenance

---

### 8. Testing Infrastructure Improvements

#### Original Problems of current testing

- Hardcoded fixtures
- No reusable helpers for auth flows
- Slow setup and duplicated boilerplate

#### Implemented Solution for testing

- Factory pattern for fixtures (`UserFactory`)
- Auth helpers to reduce duplication (`AuthHelper`)
- Cleaner E2E test suites with consistent setup/teardown

Factory example:

```ts
@Injectable()
export class UserFactory {
  constructor(
    private readonly usersRepository: UsersRepository,
    @Inject(authConfig.KEY) private auth: ConfigType<typeof authConfig>,
  ) {}

  async create(overrides: OverrideCreateUserDto = {}, roles?: number[]) {
    const password = await bcrypt.hash(
      overrides.password ?? 'password123',
      this.auth.salt,
    );

    const id = await this.usersRepository.create({
      email: overrides.email ?? `test${Date.now()}@mail.com`,
      password,
    });

    if (roles?.length) {
      await Promise.all(
        roles.map((roleId) =>
          this.usersRepository.assignRoleToUser(id!, roleId),
        ),
      );
    }

    return { id, email: overrides.email, password: overrides.password };
  }
}
```

#### Benefits of new tests infrastructure

- Faster tests with less boilerplate
- Reusable fixtures and helpers
- Better coverage of real flows (auth, roles, permissions)
- Easier maintenance during refactors

---

### 9. Manual Documentation with Postman

#### Original Problems with manual documentation

- Manual documentation (Postman collection) drifting from code
- No standard API documentation
- Harder onboarding for frontend and contributors

#### Implemented Solution -> Using NestJS swagger integration

- Auto-generated Swagger docs using `@nestjs/swagger`
- DTO decorators for request/response schemas
- Bearer auth integration

Example:

```ts
const config = new DocumentBuilder()
  .setTitle('e-commerce')
  .setDescription('A e-commerce built with NestJS')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, config));
```

#### Benefits of using Swagger for documentation

- Documentation stays synced with code
- Interactive UI for testing endpoints
- OpenAPI-compatible specification for external tooling

---

## Low Priority Changes

### 10. Event-Driven Architecture

#### Issues of current architecture

- Domain operations produced side effects directly inside services
- No standardized way to notify other modules of domain changes
- Hard to extend workflows (notifications, auditing, real-time updates)

#### Implemented Solution -> Migrated to Event Driven Development

- Domain events created and emitted using `@nestjs/event-emitter`
- Listeners react to domain events and execute side effects
- SSE integration for real-time notifications

Event definitions:

```ts
export const USER_CREATED_EVENT_KEY = 'user.created';
export class UserCreatedEvent extends UserDto {}

export const USER_ROLE_CHANGED_EVENT_KEY = 'user.role.changed';
export class UserRoleChangedEvent {
  id: number;
  roles: Role[];
}
```

Event emission example:

```ts
this.eventEmitter.emit(USER_CREATED_EVENT_KEY, {
  ...createUserDto,
  id: userId,
} satisfies UserCreatedEvent);
```

Listener example:

```ts
@OnEvent(USER_CREATED_EVENT_KEY)
async handleUserCreatedEvent(event: UserCreatedEvent) {
  const customerRole = await this.roleRepository.findById(RoleIds.Customer);
  if (!customerRole) throw new InvalidRole();

  await this.usersRepository.assignRoleToUser(event.id, customerRole.id);
}
```

SSE notification example:

```ts
@OnEvent(USER_ROLE_CHANGED_EVENT_KEY)
handleUserRoleChangedEvent(event: UserRoleChangedEvent) {
  this.eventsService.sendEvent(event.id, USER_ROLE_CHANGED_EVENT_KEY, {
    message: `Your roles has been updated to ${(event.roles ?? [])
      .map((role) => role.name)
      .join(', ')}`,
  });
}
```

#### Benefits of event driven development

- Reduced coupling between domains
- Side effects are isolated into listeners
- Easier to extend and scale async workflows
- Enables real-time UX via SSE

---

### 11. Dynamic Product Attributes

#### Problems of original solution (schema defined in code, DB flexible)

- Product attributes were fixed/hardcoded
- Adding attributes required schema changes
- Categories could not define different attribute sets

#### Implemented Solution -> Adding a table for specificating attributes for category on DB

- Categories define allowed attributes via `ManyToMany`
- Product stores values via `ProductAttribute`
- Validation ensures product attributes match its category attributes

Entity mapping example:

```ts
@Entity()
export class Category {
  @ManyToMany(() => Attribute, (attribute) => attribute.categoryAttributes)
  @JoinTable()
  attributes: Attribute[];
}

@Entity()
export class ProductAttribute {
  @ManyToOne(() => Product, (product) => product.attributes)
  product: Product;

  @ManyToOne(() => Attribute)
  attribute: Attribute;

  @Column({ type: 'varchar' })
  value: string;
}
```

Validation/upsert flow:

```ts
const categoryAttributesMap = new Map(
  category.attributes.map((a) => [a.name, a]),
);

const isValid = Object.entries(attributes).every(([name]) =>
  categoryAttributesMap.has(name),
);

if (!isValid)
  throw new ProductInvalidAttributes(category.attributes, attributes);

// upsert values
await this.productAttributeRepository.upsertProductAttributes(valuesToSave);
```

#### Benefits of new DB Driven attributes

- Attribute model is flexible and scalable
- No schema changes required for new attributes
- Strong validation guarantees consistency
- Categories control the product attribute “schema”

---

## Change Summary

| #   | Change                    | Priority | Status | Impact                                    |
| --- | ------------------------- | -------- | ------ | ----------------------------------------- |
| 1   | Secure Routes by Default  | High     | ✅     | +Security                                 |
| 2   | JWT without PII           | High     | ✅     | +Security                                 |
| 3   | Dependency Upgrades       | High     | ✅     | 0 reported vulnerabilities                |
| 4   | Config Management         | High     | ✅     | +Security -Errors configuring environment |
| 5   | Versioned Seeds           | High     | ✅     | Safe rollbacks                            |
| 6   | Repository Pattern        | High     | ✅     | +Maintainability                          |
| 7   | Domain Errors             | Medium   | ✅     | +Error handling                           |
| 8   | Testing Infra             | Medium   | ✅     | +coverage                                 |
| 9   | Swagger Docs              | Medium   | ✅     | Docs always synced                        |
| 10  | Event-Driven Architecture | Low      | ✅     | +Scalability                              |
| 11  | Dynamic Attributes        | Low      | ✅     | +Flexibility                              |
