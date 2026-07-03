# AGENTS.md — BizFlow Platform Operating Manual

This document is the definitive operating manual and architecture control contract for all AI coding agents (Claude, Antigravity, Cursor, Copilot, GPT, etc.) working on this repository.

---

## 1. Repository Architecture & Service Boundaries

BizFlow Platform is organized as a multi-service monorepo. Agents must respect boundaries, responsibilities, and dependency directions.

```
BizFlow-Flatform/ (Monorepo Root)
├── frontend/             # Next.js 14 Web Application (POS, Owner Dashboard, Admin Portal)
├── backend/              # ASP.NET Core 8 Web API (Clean Architecture core)
├── ai-service/           # FastAPI Microservice (Whisper STT & Gemini entity extraction)
├── mobile/               # Flutter Mobile Client (Cashier voice input & attendance)
└── database/             # Schema bootstrap scripts (Local dev only)
```

### Dependency Direction Constraints
- **Frontend & Mobile Clients** MUST interact with the **Backend API** for all transaction and database operations.
- **Mobile Client** MUST upload audio to the **AI Service** for transcription and extraction.
- **AI Service** MUST NOT query the database directly. It must act as a stateless pipeline returning draft order JSON to the requesting client.
- **Cross-Service API Contract Changes** MUST be validated against the recipient DTO schemas to prevent JSON serialization mismatches.

---

## 2. Backend Conventions (.NET 8 Clean Architecture)

The backend code MUST adhere strictly to the following layered conventions:

### Layer Responsibilities
- **Domain Layer (`BizFlow.Domain`):** Contains core enterprise entities, value objects, domain enums, and constants. It MUST NOT reference any other layer or external package (e.g. EF Core or WebApi).
- **Application Layer (`BizFlow.Application`):** Defines service interfaces, DTOs, CQRS commands/queries (if applicable), and validator definitions.
- **Infrastructure Layer (`BizFlow.Infrastructure`):** Implements external services (Auth, Caching, DB access, EF Core Migrations).
- **WebApi Layer (`BizFlow.WebApi`):** Houses HTTP controllers, SignalR hubs, route definitions, and startup middleware configurations.

### Coding Rules
1. **No Business Logic in Controllers:** Controllers MUST only perform input binding, authorization check delegation, and response formatting. All business logic, database queries, and ledger updates MUST reside in Application Services or Domain Services.
2. **Dependency Injection (DI):** All dependencies MUST be registered via their abstraction (interface) in `DependencyInjection.cs`. Implementations MUST NOT be instantiated manually via `new` in business code.
3. **Data Annotations & FluentValidation:**
   - Input DTOs MUST be validated before reaching service logic.
   - The attribute `[ValidateNever]` MUST NOT be used to bypass model validation on core business entities (like `Order`).
4. **Exception Handling & Response Formatting:**
   - Stack traces and raw database exception messages MUST NOT be returned in API responses to clients.
   - Standard HTTP status codes MUST be returned: `400 BadRequest` for validation/logic failures, `401 Unauthorized` for expired/invalid auth, `403 Forbidden` for role check failures, and `404 NotFound` for missing resources.
5. **Caching:** Redis is the registered distributed cache provider. Large read-heavy datasets (such as product categories or subscription plan metadata) SHOULD use `IDistributedCache` before querying PostgreSQL.

---

## 3. Frontend Conventions (Next.js 14)

### Folder & Component Structure
- All core business components MUST be placed in `src/components/`.
- Page routes MUST follow Next.js 14 App Router conventions inside `src/app/`.
- Reusable UI elements MUST be stateless and presentational. State orchestration MUST be kept in container components or custom hooks.

### Networking & API Integration
- **Zero Hardcoded localhost URLs:** All HTTP requests MUST target `process.env.NEXT_PUBLIC_API_URL` (or the default fallback determined at build time). Hostnames and ports MUST NOT be embedded as raw string literals.
- **React Query (TanStack Query):** All server mutations and queries MUST use TanStack Query hooks. Direct `fetch` or `axios` calls inside UI component `useEffect` blocks are forbidden for transaction endpoints.
- **Authentication Token Lifecycle:** JWT tokens MUST be stored securely. If stored in `localStorage`, agents must evaluate XSS risks. In production configurations, `HttpOnly` cookie storage is preferred.
- **Tenancy Context Isolation:** Local storage keys MUST be isolated per tenant ID where appropriate to avoid data collisions during local test runs.

---

## 4. AI Service Conventions (FastAPI & Python)

### Performance & Safety
- **Prompt Injection Prevention:** User voice transcripts or raw text inputs MUST be escaped and wrapped in strict system prompt boundaries. Raw text inputs MUST NOT be placed directly at the end of prompt strings.
- **MIME-Type & Size Validation:** The `/api/voice-order` endpoint MUST validate files by checking both the filename extension AND the MIME-type from the file headers. A maximum file size constraint (e.g., 10MB) MUST be enforced.
- **Statelessness:** The AI service MUST NOT write or read database records.
- **Whisper Load Optimization:** The OpenAI Whisper model (e.g., base) MUST be loaded at service startup, NOT lazily during the first HTTP request, to prevent request timeouts.

---

## 5. Mobile Conventions (Flutter)

### Client Standards
- **Secure Storage:** All authentication tokens, tenant details, and user profiles MUST be stored using `flutter_secure_storage`. Plain text key-value stores (such as SharedPreferences) MUST NOT be used for JWT tokens.
- **Network Call Standardization:** All remote calls MUST use a centralized client wrapper that automatically appends `Authorization: Bearer <Token>` and `X-Tenant-Id` headers.
- **State Management:** Keep business logic separated from visual widgets using Provider or Bloc patterns.

---

## 6. Database & Migration Rules (CRITICAL)

BizFlow uses Entity Framework Core 8 Code-First migrations as the **only source of truth** for database schemas.

### STRICTLY FORBIDDEN
- **No runtime DDL SQL execution:** Using `ExecuteSqlRaw` or similar methods to run `CREATE TABLE`, `ALTER TABLE`, or schema manipulations in application services is strictly forbidden.
- **No manual SQL scripts in production:** Scripts like `database/init.sql` must only be used as local Docker development bootstraps.

### Migration Smoke-Test Workflow
For every schema change, the agent MUST run the following steps locally:
1. Generate the migration:
   ```bash
   dotnet ef migrations add <MigrationName> --project src/BizFlow.Infrastructure --startup-project src/BizFlow.WebApi
   ```
2. Verify `Up()` and `Down()` logic.
3. Run a smoke-check:
   ```bash
   dotnet ef migrations add SmokeTest --project src/BizFlow.Infrastructure --startup-project src/BizFlow.WebApi
   ```
4. If the `SmokeTest` migration contains **any operations** (e.g. `CreateTable`, `AddColumn`), schema drift is detected. STOP and fix the DbContext mapping.
5. Remove the smoke migration before committing:
   ```bash
   dotnet ef migrations remove --project src/BizFlow.Infrastructure --startup-project src/BizFlow.WebApi
   ```

### Constraints & Indexes
- Every business table MUST include a foreign key to the `Tenants` table.
- Indexing strategy: Columns frequently used in filters (`TenantId`, `ProductId`, `CustomerId`, `Date`) MUST be indexed.
- Delete Behavior: Foreign keys to master/parent tables MUST use `DeleteBehavior.Restrict` or `DeleteBehavior.SetNull` to prevent accidental cascading deletes of historical financial data.

---

## 7. Multi-Tenant Architecture & Data Security

### Tenant Isolation
- **Global Query Filters:** All tenant-specific entities mapped in `ApplicationDbContext.cs` MUST have a query filter applied during `OnModelCreating`:
  ```csharp
  modelBuilder.Entity<MyEntity>().HasQueryFilter(e => CurrentTenantId == null || e.TenantId == CurrentTenantId);
  ```
- **No Fallback to Default Tenant:** API endpoints and service methods MUST NOT fallback to a default or development tenant GUID (such as `"11111111-1111-1111-1111-111111111111"`) if the tenant context is missing. If authentication or tenant header validation fails, an unauthorized response MUST be returned.
- **Cross-Tenant Queries:** Platform admin controllers performing cross-tenant operations MUST reside in separate admin-only namespaces, require the `PlatformAdmin` role, and be audited.

---

## 8. Authentication & Authorization

### Authentication Verification
- Custom token parsing logic (e.g., splitting authorization headers to extract IDs without signature checking) is **strictly forbidden**. All endpoints requiring user identification MUST utilize claims extracted by the verified ASP.NET Core JWT middleware.
- JWT secret keys, DB passwords, and API credentials MUST NOT be committed to version control in plaintext. Use environment variable placeholders (`${MY_SECRET}`).

### Role Enforcement
- Endpoints MUST be protected using explicit role-based or policy-based authorization attributes.
- **Default Fail-Closed Policy:** All controllers MUST inherit from `ApiControllerBase` or use `[Authorize]` at class-level. Public endpoints must be explicitly decorated with `[AllowAnonymous]`.

---

## 9. Accounting Rules (TT88 Compliance)

BizFlow must comply with **Thông tư 88/2021/TT-BTC** for Vietnamese individual business households.

### Data Model Rules
- **Accounting Ledgers (S1-ĐH, S2-ĐH, S3-ĐH):** Must act as the immutable source of truth.
- **Cash Book & Inventory Balance:** Must be calculated by aggregating ledger entries (`accounting_ledger_s2` for inventory, `cash_transactions` for cash). Cached columns (like `products.StockQuantity`) are auxiliary data and MUST NOT be trusted as the ultimate balance in case of conflicts.
- **Immutability Constraint:** Completed transactions posted to accounting ledgers, cash books, or tax records MUST NOT be updated (`UPDATE`) or deleted (`DELETE`).
- **Correction Protocol:** Errors must be corrected only by creating reversing entries (negative amounts) or adjustment transactions.
- **Period Lock:** When an accounting period (month/quarter/year) is locked by the owner, no new transactions can be back-dated into the locked period.

---

## 10. Anti-Hallucination Rules

When writing code or generating configurations, coding agents MUST follow these strict guidelines to prevent system failures:

1. **Verify Before Implementing:**
   - DO NOT assume an API endpoint exists. Look it up in the Controllers folder.
   - DO NOT assume a database column exists. Look it up in the Entity definitions (`BizFlow.Domain/Entities`).
   - DO NOT assume a DTO field is available. Verify the definition in the DTO or Request classes.
2. **Do Not Generate Hardcoded Secrets:**
   - DO NOT hardcode developer-specific GUIDs, database passwords, bypass backdoor keys (e.g. `"internal_ai_secret_code_123"`), or signing credentials.
3. **Handle Missing Information:**
   - If you cannot find a configuration key, an endpoint, or an implementation detail, you MUST leave a `// TODO:` comment or ask the user for clarification. Do not make assumptions.

---

## 11. Code Review Severity

When auditing or reviewing code changes, classify issues using the following checklist:

| Severity | Definition |
|---|---|
| **Critical (P0)** | Cross-tenant data leaks, unauthenticated financial writes, committed credentials/db backups, or accounting immutability violations. |
| **High (P1)** | Security signature validation bypass, lack of authentication on state-changing endpoints, CORS wildcard on write APIs, or missing query filters. |
| **Medium (P2)** | Model validation bypass (`[ValidateNever]`), hardcoded local dev credentials, duplicate logic, or missing transaction boundaries. |
| **Low (P3)** | Code styling issues, unused import directives, or redundant local log statements. |

---

## 12. Critical Failure Conditions

Any of the following violations constitutes a **CRITICAL** failure. An agent MUST flag these immediately during code generation or review:
- Missing TenantId filters or default tenant fallbacks.
- Posted accounting ledger mutations (UPDATE/DELETE on ledger tables).
- AI service auto-posting or auto-confirming transactions directly without human review.
- Schema drift or executing raw SQL schema modifications at runtime.
- Committing plaintext secrets or seeding production credentials.

---

## 13. Mandatory Agent Workflow

AI coding agents MUST execute the following workflow step-by-step for every task:

1. **Information Discovery:** Read `README.md`, `.agents/AGENTS.md`, and `functional_specs.md` first.
2. **Context Analysis:** Identify the affected service layers (Frontend, Backend, AI, Mobile, DB, Docker).
3. **Dependency Tracing:** Identify all callers, consumers, and internal dependency injection registrations.
4. **Contract Verification:** Inspect the JSON DTOs, API routing definitions, and serialization settings.
5. **Implementation & Refactoring:** Apply the code changes matching existing styles.
6. **Self-Review Checklist:** Scan the code against security, tenant-isolation, and performance rules.
7. **Documentation Update:** Sync any configuration changes or API mutations to `README.md` and related schemas.
8. **Validation & Verification:** Validate that the application compiles, builds, and runs cleanly.
9. **Outcome Reporting:** Produce a concise summary of the changes, verification results, and any remaining gaps.

---

## 14. Evidence-First Policy

To eliminate hallucination and false assumptions, the agent MUST adhere to this strict verification policy:

- **Zero Guessing:** Do NOT state any architectural fact, API path, database structure, or system behavior without referencing concrete code evidence in the repository.
- **Valid Sources of Truth:** Rely ONLY on active source code, configuration manifests (`appsettings.json`, `.env`), Docker files, migrations history, and official documents inside this repository.
- **Boundary Handling:** If evidence is missing or context is ambiguous, the agent MUST NOT invent the behavior. Instead, leave a clear `// TODO:` comment or ask the user for clarification.

---

## 15. Architecture Protection Rules

To prevent architecture drift, coding agents MUST preserve all core design decisions of the repository:

- **Clean Architecture Protection:** Maintain the boundaries of WebApi, Infrastructure, Application, and Domain layers. Do NOT bypass layers or introduce circular dependencies.
- **ORM Preservation:** Do NOT substitute EF Core 8 with other ORMs or thô database query mechanisms unless explicitly requested.
- **SignalR Hub Security:** Keep the real-time notification mechanism implemented on SignalR and ensure hubs are protected with appropriate authentication.
- **Supabase Integration:** Maintain the Supabase cloud PostgreSQL connection configuration and the local Docker Alpine-Postgres helper setup.

---

## 16. Cross-Service Change Checklist

Whenever a change is proposed to one component, the agent MUST run this checklist to determine if other components require updates:

- [ ] **Database Schema:** If changed, update EF Core entities, register DbContext configurations, and generate migrations.
- [ ] **Backend API:** If database models or DTOs changed, update WebApi controllers and services.
- [ ] **Frontend Web:** If backend APIs changed, update React Query hooks, fetch parameters, and API base URL configs.
- [ ] **Mobile Client:** If backend APIs changed, update Flutter models, secure storage parameters, and network client wrappers.
- [ ] **AI Service:** If the voice processing flow changed, update FastAPI routes, Gemini models, or prompt parameters.
- [ ] **Docker Orchestration:** If environment variables or build configurations changed, update `docker-compose.yml` and Dockerfiles.

---

## 17. Documentation Synchronization Policy

No code modification affecting endpoints or core behaviors should leave documentation outdated. The agent MUST verify if the following require documentation sync:

- **API Mutations:** Update `README.md` and OpenAPI Swagger comments.
- **Enums & Roles:** Update the permissions matrix and roles description in `README.md`.
- **Environment Variables:** Document any new configuration keys in both backend `appsettings.json` and frontend `.env` lists.
- **Accounting Rules:** Sync any changes to S1/S2/S3 bookkeeping logic with Circular 88 reference guides.

---

## 18. Breaking Change Policy

Before deleting, renaming, or modifying any of the following, the agent MUST identify every consumer inside the monorepo:
- API endpoint paths and HTTP request methods.
- Database columns and EF Core entity property names.
- DTO fields and request/response models.
- Enums, configuration keys, or environment variables.

If the change breaks the frontend, mobile app, AI service, or test suites, the agent MUST NOT proceed without documenting a migration/backward-compatibility path.

---

## 19. Performance Checklist

Every code modification MUST be audited against the following performance bottlenecks:

- [ ] **N+1 Queries:** Do NOT run database queries inside loops. Use eager loading (`.Include()`) or projections (`.Select()`) where appropriate.
- [ ] **Unnecessary SaveChanges:** Avoid calling `SaveChangesAsync()` repeatedly within a single transaction boundary.
- [ ] **Synchronous I/O:** Do NOT use blocking synchronous calls (e.g. `.Result`, `.Wait()`, `.Read()`, `.Write()`). Always use the matching async APIs.
- [ ] **Large Include Chains:** Avoid massive, multi-level `.Include()` paths that produce Cartesian explosions in database queries.
- [ ] **Blocking Async Code:** Avoid thread pool starvation by avoiding `Task.Run()` for short, CPU-bound operations in Web API request pipelines.

---

## 20. Definition of Done (DoD)

A task is not considered complete until the agent meets all of the following requirements:

- [ ] **Successful Build:** The affected projects compile and build successfully without errors or warnings.
- [ ] **Security Audited:** Authorization decorators (`[Authorize]`) are present, and JWT signature verification is intact.
- [ ] **Tenant Isolation Verified:** All business queries filter by `TenantId`, and global query filters are actively applied.
- [ ] **Migration Cleanliness:** Database migrations have been tested, and smoke-checks indicate zero schema drift.
- [ ] **Zero Hardcoded Secrets:** No passwords, bypass keys, or API keys are committed in plaintext.
- [ ] **Zero Fictional TODOs:** No unresolved warnings or unexplained placeholders are left in the codebase.

---

## 21. Repository Knowledge Boundaries

The agent MUST explicitly distinguish between established facts and assumptions:

- **No Fictional Endpoints:** Only use endpoints actively mapped in the WebApi controllers.
- **No Fictional DB Columns:** Only map attributes defined in EF Core entity definitions.
- **No Fictional DTO Fields:** Only instantiate properties present in DTO classes.
- **No Fictional Permissions:** Only enforce roles and policies declared in `Program.cs`.

---

## 22. AI Behavior Rules

- **Low-Confidence Mode:** If the agent lacks repository evidence or confidence in a technical direction, it MUST stop, state the unknown factors, and request clarification.
- **Banned Implementations:** The agent is FORBIDDEN from generating fictional code placeholders or placeholders that bypass security rules.
- **Fail-Safe Rules:** Keep AI services stateless, optional, and decoupled from the transactional flow of POS.
