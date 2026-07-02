# BizFlow AI Context

## 1. Project Identity
- **What BizFlow is**: A comprehensive SaaS Point of Sale (POS) and automated bookkeeping platform.
- **Target users**: Individual business households (hộ kinh doanh cá thể) and traditional retail stores in Vietnam.
- **Core business value**: Eliminates manual bookkeeping by fully automating inventory and financial accounting to strictly comply with Circular 88/2021/TT-BTC. It provides an AI Voice Assistant to help non-tech-savvy users create orders simply by speaking.

## 2. Tech Stack
- **Frontend**: Next.js 14 (App Router)
- **Backend**: .NET 8 (C#) using a Clean-Architecture-inspired layered design (not strict clean architecture).
- **AI service**: Python FastAPI (utilizing Whisper for speech-to-text and Gemini for entity extraction)
- **Mobile**: Flutter
- **Database**: PostgreSQL (hosted on Supabase)
- **Infra**: Docker, Redis, Adminer

## 3. Monorepo Structure
- `backend/`: The .NET 8 API server containing the core business logic, Domain, Application, and Infrastructure layers.
- `frontend/`: The Next.js 14 web application for POS and store management.
- `mobile/`: The Flutter application used by employees to scan barcodes, manage carts, and record voice orders.
- `ai-service/`: A standalone Python FastAPI microservice that processes audio and extracts order entities, physically isolating ML workloads from the main backend.

## 4. Important Context: Design != Current Implementation
This repository contains both:
1. Intended architecture (documented in AGENTS.md / DESIGN.MD)
2. Actual implementation (current codebase)

They are NOT fully aligned. 

When conflicts exist:
* Trust actual code behavior for debugging
* Trust AGENTS.md for intended future architecture
* Always explicitly mention when code diverges from design

## 5. Runtime Architecture
**Request Lifecycle**: Client -> API (Controllers) -> Service Layer -> DbContext -> SignalR (Optional)
- **Synchronous Monolith**: The backend is a traditional synchronous request-response API.
- **No background workers**: All logic, including complex ledger calculations, executes in the HTTP request thread.
- **No queue/outbox**: There are no message queues (e.g., RabbitMQ, Kafka) or Hangfire/Quartz jobs operating outside the request lifecycle. Real-time notifications push synchronously via an injected SignalR `NotificationHub`.

## 6. Domain Model
- **Tenant**: Represents a registered business/store. The root of isolation.
- **User**: The authentication identity.
- **EmployeeProfile**: HR details mapped 1-to-1 with a User.
- **Product**: Catalog items. Belongs to a Tenant and supports multiple units.
- **Order**: A sales transaction. Contains 1:N OrderItems.
- **Customer**: A buyer profile tracking aggregated debt (TotalDebt).
- **DebtTransaction**: Individual credit/payment events affecting a customer's balance.
- **InventoryReceipt**: Tracks incoming stock additions.
- **AccountingLedgerS2**: The strict inventory ledger mandated by Circular 88 for tracking stock values and quantities.

*Relationships*: `Tenant` isolates all major entities (1:N). `Order` deducts from `Product` and logs to `AccountingLedgerS2`. `Order` (if debt) increases `Customer.TotalDebt` and creates a `DebtTransaction`.

## 7. Multi-Tenant Model
- **Shared database**: All tenants coexist in the same PostgreSQL database.
- **TenantId isolation**: Data is partitioned using a `TenantId` column on business entities.
- **JWT tenant claim**: EF Core utilizes a Global Query Filter relying on the JWT `tenant_id` claim via `ICurrentTenantService`.
- **Current architecture weakness**: The system trusts explicit `X-Tenant-Id` HTTP headers in controllers but uses JWT claims in the DbContext. 
- **CRITICAL WARNING**: Current tenant isolation is NOT fully safe. The EF Core global query filter (`CurrentTenantId == null || e.TenantId == CurrentTenantId`) fails open. If a request lacks authentication or runs in a background context, it exposes data across all tenants globally.

## 8. Authorization Model
- **Admin**: Platform administrator managing SaaS subscriptions and system-wide configurations.
- **Owner**: Store owner with full access to tenant configurations, TT88 reports, and inventory management.
- **Employee**: Cashier restricted to POS operations and handling AI draft orders.
- **CRITICAL WARNING**: Current audit found no evidence of explicit `[Authorize(Roles = "...")]` enforcement in controllers. RBAC may be incomplete and must be verified before assuming endpoints are protected.

## 9. Bug Severity Model
Based on `AGENTS.md`, use the following severity definitions:
- **Critical**: Data loss / financial corruption / tenant leak / overselling
- **High**: Security / auth bug / missing ledger writes
- **Medium**: Logic bug / temporary fallback code in production
- **Low**: Style / refactor / obsolete comments

## 10. Critical Business Invariants
*These rules must never be violated when writing or modifying code:*
- **No cross-tenant leak**: All queries must respect `TenantId`.
- **AI cannot auto-confirm transaction**: AI output only generates a `Draft Order`. A human must always explicitly confirm it.
- **Posted accounting entries immutable**: Never use UPDATE or DELETE on posted ledger rows.
- **Ledger consistency required**: The `AccountingLedgerS2` must balance exactly with actual stock movements.
- **TT88 compliance mandatory**: Accounting rules dictate all financial flow structures.

## 11. Inventory Architecture
- **Dual-write architecture**: Order and Inventory services currently mutate both a legacy cache field and write to the ledger.
- **Product.StockQuantity still actively used**: Despite being marked `[Obsolete]`, this cache field is the actual source of truth for POS stock validation and UI display.
- **AccountingLedgerS2 is NOT yet authoritative**: The ledger is intended to govern stock but is actively ignored in runtime checkout logic; it is currently only used for TT88 reporting.
- **CRITICAL WARNING**: Migration to ledger-only is incomplete. Order cancellation logic actively skips writing to the ledger, causing permanent, unrecoverable data drift between `StockQuantity` and `AccountingLedgerS2`.

## 12. Accounting Rules
- **TT88**: Financial logic must adhere to Thông tư 88/2021/TT-BTC.
- **Append-only correction**: Mistakes are fixed by issuing reversal or negative adjustment entries.
- **Period lock**: (Implicit requirement) Past accounting periods cannot accept new transactions once closed.
- **No mutation of posted ledger**: `AccountingLedgerS2` and `AccountingEntry` rows are immutable post-creation.

## 13. AI Workflow
**Flow**: `Voice -> Whisper (STT) -> Gemini extraction (NLP) -> Draft Order -> Human approval -> Final order`
- **Important**: AI output is untrusted until human approval. The AI microservice returns a JSON payload to the mobile app, which then submits a Draft Order to the .NET backend. The backend pushes a SignalR event to the POS, awaiting human confirmation before deducting stock.

## 14. Known Architectural Debt
- **Fail-open tenant filter**: Missing JWTs disable the EF Core isolation filter.
- **Inventory drift**: `CancelOrderAsync` intentionally omits ledger reversal writes.
- **Race condition / oversell**: The system lacks Optimistic (`RowVersion`) and Pessimistic (`FOR UPDATE`) locking. Concurrent requests can oversell stock and corrupt financial totals (Lost Update anomaly).
- **Potential RBAC gap**: Current audit found insufficient evidence of role-based protection for Admin/System endpoints. Must verify before assuming safe authorization boundaries.
- **Prototype mocks still exist**: Several mobile UI elements (Barcode scanner, Thermal printing, Shift reports) and backend services (duplicate `NotificationService` mock, plain-text password fallbacks) rely on dangerous temporary workarounds.

## 15. Known Dangerous Files
*Exercise extreme caution when modifying or depending on these files:*
- `ApplicationDbContext.cs` (Failing open global query filters)
- `OrderService.cs` (Unsafe concurrency, missing ledger writes, obsolete field usage)
- `InventoryService.cs` (Dual-write logic, stubbed FIFO fallbacks)
- `AuthService.cs` (Plain-text password fallbacks, unfiltered queries)
- `CurrentTenantService.cs` (Disjointed tenant resolution logic)

## 16. Architectural Decision Sources
When architectural decisions conflict, use this priority order:
1. AGENTS.md (business constraints and hard rules)
2. ADRs/ (accepted architectural decisions)
3. AI_CONTEXT.md (current system snapshot)
4. current-issues.md (known active problems)

## 17. Coding Rules for Future Agents
When modifying code:
- **Always check TenantId safety**: Ensure you aren't bypassing the `CurrentTenantService` or relying on unvalidated headers.
- **Audit transaction boundaries**: Ensure multi-table mutations are wrapped in `_context.BeginTransactionAsync()`.
- **Review migrations**: Never manipulate DB schemas using raw SQL; always generate EF Core migrations.
- **Never trust mock data**: Actively identify and replace remaining prototype logic.
- **Treat accounting bugs as critical**: Data corruption in `AccountingLedgerS2` or `DebtTransaction` directly violates legal compliance (TT88).

## 18. Required Agent Workflow
Before making significant code changes:
1. Explain current behavior
2. Explain intended behavior
3. Identify architectural risks
4. Classify severity (Critical / High / Medium / Low)
5. Propose minimal safe fix
6. Avoid broad refactors unless explicitly requested
