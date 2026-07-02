# ADR-001: Multi-tenant Strategy

## Status
Accepted

## Context
BizFlow is a SaaS platform serving individual business households and retail stores. The system must completely isolate data between different stores so that no business can see another business's products, orders, or customers.

## Decision
We chose a **Shared Database, Shared Schema** architecture. All tenant data is stored in the same PostgreSQL tables. Isolation is enforced via a `TenantId` column on every business entity, combined with EF Core Global Query Filters that automatically append `e.TenantId == CurrentTenantId` to LINQ queries based on a JWT claim.

## Rationale
- **Cost and Operational Overhead**: A single shared database is vastly cheaper and easier to maintain than a Database-per-Tenant or Schema-per-Tenant approach, especially for thousands of small retail stores.
- **Developer Experience**: EF Core Global Query Filters allow developers to write natural LINQ queries without manually appending `Where(x => x.TenantId == ...)` every time, theoretically reducing accidental leaks.

## Alternatives Considered
* **Database-per-Tenant**: Provides maximum security and physical isolation, but is prohibitively expensive and makes schema migrations incredibly difficult to orchestrate across thousands of databases.
* **Schema-per-Tenant**: Better isolation than shared schema, but still complex to migrate and puts a strain on PostgreSQL's connection pooling and metadata overhead.

## Consequences
Pros:
* Lowest infrastructure cost.
* Simple schema migrations (just one DB to update).
* Centralized analytics capability.

Cons:
* A single logic bug in the application layer can expose data across all tenants horizontally.
* "Noisy neighbor" problem: one heavy tenant can degrade performance for everyone else on the shared database.

## Current Reality vs Intended Design
While `AGENTS.md` strictly dictates that tenant isolation is paramount, the **current implementation is deeply flawed and actively vulnerable**. 
1. **Fail-Open Filter**: The EF Core filter is implemented as `CurrentTenantId == null || e.TenantId == CurrentTenantId`. This means any unauthenticated request or background task where `CurrentTenantId` evaluates to `null` will completely bypass tenant isolation and fetch global data.
2. **Conflicting Resolution Mechanisms**: The DB context relies on a JWT `tenant_id` claim, but the API controllers explicitly trust an `X-Tenant-Id` HTTP header supplied by the client, passing it directly to the service layer. This creates a dangerous dichotomy between intended security boundaries and actual code behavior.
