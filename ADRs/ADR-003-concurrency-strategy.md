# ADR-003: Concurrency Strategy

## Status
Accepted (De-facto)

## Context
Multiple cashiers in the same store might attempt to sell the exact same item concurrently. We need a strategy to handle conflicting writes to high-contention fields like `Product.StockQuantity` and `Customer.TotalDebt`.

## Decision
The system currently relies exclusively on EF Core's default **Last Write Wins** behavior, paired with standard PostgreSQL implicit `Read Committed` transaction boundaries.

## Rationale
Implementing Optimistic Concurrency (`RowVersion`) or Pessimistic Concurrency (`SELECT FOR UPDATE`) requires additional developer effort, specialized EF Core configurations, and complex retry loops in the UI when conflicts occur. The initial prototype favored rapid development over strict transaction safety.

## Alternatives Considered
* **Optimistic Concurrency (RowVersion/Timestamp)**: Throws a `DbUpdateConcurrencyException` if a row is modified by another thread between read and save. Safe, but requires UI-level retry logic.
* **Pessimistic Concurrency (Row Locks)**: Locks the row at the database level (`FOR UPDATE`) so concurrent threads wait in queue. Highly safe, but can cause deadlocks and slow down throughput.

## Consequences
Pros:
* Fast initial development.
* No complex EF Core configuration required.
* Simple user experience (no "Resource Modified" error popups).

Cons:
* Massive risk of **Lost Update anomalies**.

## Current Reality vs Intended Design
The lack of concurrency control fundamentally contradicts the strict financial integrity requirements outlined in `AGENTS.md`. 

Because two concurrent threads can read the same `StockQuantity`, pass the `if (StockQuantity < request)` validation, and then blindly overwrite the database with their respective deductions, the current system is actively vulnerable to **phantom inventory creation** and **overselling**. Financial debt payments (`TotalDebt`) are equally vulnerable to silent data corruption under load.
