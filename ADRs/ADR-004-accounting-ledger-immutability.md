# ADR-004: Accounting Ledger Immutability

## Status
Accepted

## Context
BizFlow heavily markets its ability to automatically manage bookkeeping according to Circular 88/2021/TT-BTC. Legal financial ledgers must provide a reliable, auditable history of all movements.

## Decision
Accounting entries and ledger records (like `AccountingLedgerS2` and `DebtTransaction`) must be completely **immutable** once posted.

## Rationale
In standard accounting practices, finalized financial data cannot be deleted or directly updated (`UPDATE` / `DELETE` SQL commands are strictly forbidden on these tables). This guarantees a mathematically sound audit trail.

## Alternatives Considered
* **Mutable ledgers**: Allowing `UPDATE` to fix mistakes. Rejected because it destroys auditability and violates TT88 compliance rules.

## Consequences
Pros:
* Perfect auditability.
* Meets legal requirements.
* Simplifies data replication and historical reporting.

Cons:
* Correcting user mistakes requires issuing negative adjustment entries or formal reversal entries, creating more complex workflows for the end-user.
* Data volume grows significantly faster since every mistake and correction spawns new rows.

## Current Reality vs Intended Design
`AGENTS.md` defines this rule as a **CRITICAL INVARIANT**. 

The current codebase implements immutability for the Return Order flow (by posting a new `RecordImportForReturnAsync` entry instead of deleting the old one). However, the overall implementation remains incomplete. Because `CancelOrderAsync` currently skips writing ledger reversals entirely (relying only on a temporary `StockQuantity` hack), the immutability rule is technically causing the system's ledger to fall out of sync with actual business operations. A true immutable ledger requires *complete coverage* of all reversal flows.
