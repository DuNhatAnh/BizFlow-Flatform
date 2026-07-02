# ADR-002: Inventory Source of Truth

## Status
Accepted (Transitional/De-facto)

## Context
The platform must serve two distinct operational needs:
1. Low-latency checkout validation for the POS (preventing out-of-stock sales).
2. Strict legal bookkeeping compliance via Circular 88 (TT88) using `AccountingLedgerS2`.

## Decision
We utilize a **Dual-Write Architecture**. `Product.StockQuantity` is maintained as a scalar field for fast POS reads, while detailed inventory movements (Imports/Exports) are written as append-only rows to `AccountingLedgerS2`.

## Rationale
Calculating the current stock level dynamically by summing thousands of historical ledger rows for every product during a high-speed POS checkout is too slow. A cached scalar value (`StockQuantity`) is necessary for performance.

## Alternatives Considered
* **Ledger-Only Source of Truth**: Highly accurate, mathematically pure, but risks significant POS slowdowns without complex materialized views or Redis caching layers.

## Consequences
Pros:
* Fast POS checkout performance.
* Simple validation logic in the `OrderService`.

Cons:
* High risk of data divergence (drift) between the cache and the strict ledger if database transactions are not perfectly wrapped or if business logic fails to update both consistently.

## Current Reality vs Intended Design
The intended design (`AGENTS.md`) clearly states that `AccountingLedgerS2` is the strict source of truth and explicitly marks `Product.StockQuantity` as an `[Obsolete]` legacy cache field. 

**Current reality severely violates the intended design:**
1. The entire runtime API (`OrderService.cs`, POS validations, Frontend UI) still actively treats the obsolete `StockQuantity` as the authoritative source of truth.
2. The dual-write migration is fundamentally broken. For example, `CancelOrderAsync` intentionally restores `StockQuantity` but explicitly skips writing the reversal to `AccountingLedgerS2` (annotated with a `// Note: To properly revert LedgerS2... for now we'll just let InventoryTransaction be the truth` hack). This creates permanent data corruption between the POS display and the TT88 compliance ledger.
