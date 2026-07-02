# BizFlow Current Issues

## Issue Status Legend
- OPEN = chưa fix
- IN_PROGRESS = đang làm
- BLOCKED = bị chặn
- RESOLVED = đã fix

---

## ISSUE-001: Tenant Isolation Fail-Open
Status: OPEN
Severity: Critical
Area: Security / Multi-tenant

Problem:
Global query filter currently fails open when CurrentTenantId == null. 

Evidence:
- **File:** `backend/src/BizFlow.Infrastructure/Persistence/ApplicationDbContext.cs`
- **Method / Class:** `ApplicationDbContext.OnModelCreating`
- **Code snippet:**
  ```csharp
  modelBuilder.Entity<Product>().HasQueryFilter(e => CurrentTenantId == null || e.TenantId == CurrentTenantId);
  ```

Impact:
Cross-tenant data leak. If an unauthenticated user hits an endpoint missing `[Authorize]`, or if a background job executes outside an HTTP context, the `CurrentTenantId` evaluates to `null` and the database exposes all tenants' data globally.

Root Cause:
Tenant resolution depends on HttpContext JWT claim.
Missing auth causes null TenantId.

Recommended Fix:
- Fail closed when tenant context is null. 
- Modify the global query filter in `ApplicationDbContext` to strictly require matching `TenantId` (e.g., `e.TenantId == CurrentTenantId`).
- Ensure unauthenticated states gracefully reject queries at the service layer rather than relying on the DB to fail open.

Affected Files:
- ApplicationDbContext.cs
- CurrentTenantService.cs
