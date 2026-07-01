using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using BizFlow.Application.Common.Interfaces;
using BizFlow.Application.DTOs.Inventory;
using BizFlow.Application.DTOs.Common;
using BizFlow.Application.Interfaces;
using BizFlow.Domain.Entities;
using BizFlow.Domain.Enums;

namespace BizFlow.Infrastructure.Services;

public class InventoryService : IInventoryService
{
    private readonly IApplicationDbContext _context;

    public InventoryService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ReceiptDto> CreateReceiptAsync(Guid tenantId, CreateReceiptRequest request, Guid? userId = null)
    {
        using var transaction = await _context.BeginTransactionAsync();
        try
        {
            var tenant = await _context.Tenants.FindAsync(tenantId);
            if (tenant == null) throw new InvalidOperationException("Tenant not found");

            var prefix = request.Type == ReceiptType.Import ? "PN" : "PX";
            var receiptCount = await _context.InventoryReceipts.CountAsync(r => r.TenantId == tenantId && r.Type == request.Type);
            var receiptCode = $"{prefix}{(receiptCount + 1).ToString("D4")}";

            var receipt = new InventoryReceipt
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                ReceiptCode = receiptCode,
                Type = request.Type,
                Date = request.Date?.Date.Add(DateTime.UtcNow.TimeOfDay) ?? DateTime.UtcNow,
                Note = request.Note,
                DelivererReceiverName = request.DelivererReceiverName,
                ReferenceDocumentNo = request.ReferenceDocumentNo,
                ReferenceDocumentDate = request.ReferenceDocumentDate,
                ReferenceDocumentIssuer = request.ReferenceDocumentIssuer,
                WarehouseLocation = request.WarehouseLocation,
                CreatedBy = userId
            };

            decimal totalAmount = 0;
            decimal totalVatAmount = 0;

            foreach (var itemReq in request.Items)
            {
                var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == itemReq.ProductId && p.TenantId == tenantId);
                if (product == null) throw new InvalidOperationException($"Product {itemReq.ProductId} not found");

                var detail = new InventoryReceiptDetail
                {
                    Id = Guid.NewGuid(),
                    ReceiptId = receipt.Id,
                    ProductId = itemReq.ProductId,
                    DocumentQuantity = itemReq.DocumentQuantity ?? itemReq.Quantity,
                    Quantity = itemReq.Quantity,
                    UnitPrice = itemReq.UnitPrice
                };

                // VAT calculation
                var rateStr = itemReq.VatRate ?? product.VatRate;
                var rate = rateStr == "KCT" ? 0 : (decimal.TryParse(rateStr, out var r) ? r : 0);
                var includesVat = itemReq.PriceIncludesVat ?? product.PriceIncludesVat;

                detail.VatRate = rateStr;

                if (includesVat) {
                    var lineTotal = itemReq.Quantity * itemReq.UnitPrice;
                    var lineSubtotal = lineTotal / (1 + rate / 100m);
                    detail.VatAmount = lineTotal - lineSubtotal;
                    detail.TotalPrice = lineTotal;
                } else {
                    var lineSubtotal = itemReq.Quantity * itemReq.UnitPrice;
                    detail.VatAmount = lineSubtotal * (rate / 100m);
                    detail.TotalPrice = lineSubtotal + detail.VatAmount;
                }

                receipt.Details.Add(detail);
                totalAmount += detail.TotalPrice;
                totalVatAmount += detail.VatAmount;

                // Create Ledger Entry
                var lastLedger = await _context.AccountingLedgerS2s
                    .Where(l => l.TenantId == tenantId && l.ProductId == product.Id)
                    .OrderByDescending(l => l.Date)
                    .FirstOrDefaultAsync();

                var ledgerEntry = new AccountingLedgerS2
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    ProductId = product.Id,
                    ReceiptId = receipt.Id,
                    Date = receipt.Date,
                    Type = request.Type
                };

                var prevQty = lastLedger?.QuantityBalance ?? 0;
                var prevVal = lastLedger?.ValueBalance ?? 0;

                if (request.Type == ReceiptType.Import)
                {
                    ledgerEntry.QuantityIn = itemReq.Quantity;
                    ledgerEntry.ValueIn = detail.TotalPrice;
                    
                    ledgerEntry.QuantityBalance = prevQty + itemReq.Quantity;
                    ledgerEntry.ValueBalance = prevVal + detail.TotalPrice;
                    
                    product.StockQuantity += itemReq.Quantity;
                }
                else
                {
                    // Export
                    if (product.StockQuantity < itemReq.Quantity)
                    {
                        throw new InvalidOperationException($"Không đủ tồn kho cho sản phẩm {product.Name}");
                    }

                    ledgerEntry.QuantityOut = itemReq.Quantity;
                    
                    // COGS Calculation
                    if (tenant.CogsMethod == CogsMethod.WeightedAverage)
                    {
                        var unitCost = prevQty > 0 ? prevVal / prevQty : itemReq.UnitPrice;
                        ledgerEntry.ValueOut = itemReq.Quantity * unitCost;
                    }
                    else if (tenant.CogsMethod == CogsMethod.FIFO)
                    {
                        // TODO: Implement FIFO properly. Fallback to Weighted Average for now.
                        var unitCost = prevQty > 0 ? prevVal / prevQty : itemReq.UnitPrice;
                        ledgerEntry.ValueOut = itemReq.Quantity * unitCost;
                    }

                    if (!request.UseSellingPrice)
                    {
                        // Fix TotalAmount to reflect COGS for export receipts
                        totalAmount -= detail.TotalPrice;
                        totalAmount += ledgerEntry.ValueOut;
                        detail.TotalPrice = ledgerEntry.ValueOut;
                        detail.UnitPrice = itemReq.Quantity > 0 ? ledgerEntry.ValueOut / itemReq.Quantity : 0;
                    }

                    ledgerEntry.QuantityBalance = prevQty - itemReq.Quantity;
                    ledgerEntry.ValueBalance = prevVal - ledgerEntry.ValueOut;
                    
                    product.StockQuantity -= itemReq.Quantity;
                }

                _context.AccountingLedgerS2s.Add(ledgerEntry);
            }

            receipt.TotalAmount = totalAmount;
            receipt.TotalVatAmount = totalVatAmount;
            _context.InventoryReceipts.Add(receipt);

            // ALWAYS Create CashTransaction for Inventory Receipt
            var cashPrefix = request.Type == ReceiptType.Import ? "PC" : "PT";
            var cashTxType = request.Type == ReceiptType.Import ? CashTransactionType.Payment : CashTransactionType.Receipt;
            
            var dateStr = DateTime.UtcNow.ToString("yyMMdd");
            var today = DateTime.UtcNow.Date;
            var countToday = await _context.CashTransactions
                .Where(c => c.TenantId == tenantId && c.Type == cashTxType && c.CreatedAt >= today)
                .CountAsync();
                
            var seq = (countToday + 1).ToString("D3");
            var txCode = $"{cashPrefix}-{dateStr}-{seq}";
            
            var cashTx = new CashTransaction
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Type = cashTxType,
                PaymentMethod = request.PaymentMethod,
                Amount = receipt.TotalAmount,
                TransactionDate = DateTime.UtcNow,
                TransactionCode = txCode,
                Reason = request.Type == ReceiptType.Import 
                    ? $"Chi tiền nhập kho - Chứng từ {receipt.ReferenceDocumentNo ?? "Không số"}" 
                    : $"Thu tiền xuất kho - Chứng từ {receipt.ReferenceDocumentNo ?? "Không số"}",
                ReferenceDocument = receipt.ReferenceDocumentNo,
                RelatedUserId = userId,
                PayerReceiverName = request.DelivererReceiverName ?? "Người giao/nhận",
                CreatedAt = DateTime.UtcNow
            };
            _context.CashTransactions.Add(cashTx);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return MapToDto(receipt);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task CancelReceiptAsync(Guid tenantId, Guid receiptId, CancelReceiptRequest request, Guid? userId = null)
    {
        using var transaction = await _context.BeginTransactionAsync();
        try
        {
            var receipt = await _context.InventoryReceipts
                .Include(r => r.Details)
                .FirstOrDefaultAsync(r => r.Id == receiptId && r.TenantId == tenantId);

            if (receipt == null) throw new InvalidOperationException("Không tìm thấy phiếu");
            if (receipt.Status == DocumentStatus.Cancelled) throw new InvalidOperationException("Phiếu này đã được hủy trước đó");

            // Mark as cancelled
            receipt.Status = DocumentStatus.Cancelled;
            receipt.CancelledAt = DateTime.UtcNow;
            receipt.CancelledBy = userId;
            receipt.CancelReason = request.CancelReason;

            foreach (var detail in receipt.Details)
            {
                var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == detail.ProductId && p.TenantId == tenantId);
                if (product == null) continue;

                // Create Adjustment Ledger Entry for Reversal
                var lastLedger = await _context.AccountingLedgerS2s
                    .Where(l => l.TenantId == tenantId && l.ProductId == product.Id)
                    .OrderByDescending(l => l.Date)
                    .FirstOrDefaultAsync();

                var prevQty = lastLedger?.QuantityBalance ?? 0;
                var prevVal = lastLedger?.ValueBalance ?? 0;

                var ledgerEntry = new AccountingLedgerS2
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    ProductId = product.Id,
                    ReceiptId = receipt.Id,
                    Date = DateTime.UtcNow,
                    Type = receipt.Type
                };

                if (receipt.Type == ReceiptType.Import)
                {
                    // Rollback Import -> Decrease Stock
                    if (product.StockQuantity < detail.Quantity)
                        throw new InvalidOperationException($"Không đủ tồn kho để hủy phiếu nhập cho sản phẩm {product.Name}");

                    var originalLedger = await _context.AccountingLedgerS2s
                        .FirstOrDefaultAsync(l => l.ReceiptId == receipt.Id && l.ProductId == product.Id && l.Type == ReceiptType.Import);
                    var rollbackValue = originalLedger?.ValueIn ?? detail.TotalPrice;

                    ledgerEntry.QuantityOut = detail.Quantity;
                    ledgerEntry.ValueOut = rollbackValue; 
                    ledgerEntry.QuantityBalance = prevQty - detail.Quantity;
                    ledgerEntry.ValueBalance = prevVal - rollbackValue;
                    product.StockQuantity -= detail.Quantity;
                }
                else
                {
                    // Rollback Export -> Increase Stock
                    var originalLedger = await _context.AccountingLedgerS2s
                        .FirstOrDefaultAsync(l => l.ReceiptId == receipt.Id && l.ProductId == product.Id && l.Type == ReceiptType.Export);
                    var rollbackValue = originalLedger?.ValueOut ?? 0;

                    ledgerEntry.QuantityIn = detail.Quantity;
                    ledgerEntry.ValueIn = rollbackValue;
                    ledgerEntry.QuantityBalance = prevQty + detail.Quantity;
                    ledgerEntry.ValueBalance = prevVal + rollbackValue;
                    product.StockQuantity += detail.Quantity;
                }

                _context.AccountingLedgerS2s.Add(ledgerEntry);
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<PagedResult<ReceiptDto>> GetReceiptsAsync(Guid tenantId, int type = -1, int pageNumber = 1, int pageSize = 10)
    {
        var query = _context.InventoryReceipts
            .Include(r => r.Details)
                .ThenInclude(d => d.Product)
            .Where(r => r.TenantId == tenantId);

        if (type != -1)
        {
            var receiptType = (ReceiptType)type;
            query = query.Where(r => r.Type == receiptType);
        }

        var totalCount = await query.CountAsync();

        var receipts = await query
            .OrderByDescending(r => r.Date)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<ReceiptDto>
        {
            Items = receipts.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<S2LedgerReportDto> GetS2LedgerAsync(Guid tenantId, Guid productId, DateTime? startDate = null, DateTime? endDate = null, int pageNumber = 1, int pageSize = 10)
    {
        decimal openingQuantity = 0;
        decimal openingValue = 0;
        
        if (startDate.HasValue)
        {
            var lastRecordBeforeStart = await _context.AccountingLedgerS2s
                .Where(l => l.TenantId == tenantId && l.ProductId == productId && l.Date < startDate.Value)
                .OrderByDescending(l => l.Date)
                .FirstOrDefaultAsync();
                
            if (lastRecordBeforeStart != null)
            {
                openingQuantity = lastRecordBeforeStart.QuantityBalance;
                openingValue = lastRecordBeforeStart.ValueBalance;
            }
        }

        var query = _context.AccountingLedgerS2s
            .Include(l => l.Product)
            .Include(l => l.Receipt)
            .Where(l => l.TenantId == tenantId && l.ProductId == productId);

        if (startDate.HasValue) query = query.Where(l => l.Date >= startDate.Value);
        if (endDate.HasValue) query = query.Where(l => l.Date <= endDate.Value);

        var ledgers = await query.OrderBy(l => l.Date).ToListAsync();
        
        var missingReceiptIds = ledgers
            .Where(l => l.Receipt == null && l.ReceiptId.HasValue)
            .Select(l => l.ReceiptId.Value)
            .Distinct()
            .ToList();
            
        var orderCodes = await _context.Orders
            .Where(o => missingReceiptIds.Contains(o.Id))
            .ToDictionaryAsync(o => o.Id, o => o.Code);

        var records = ledgers.Select(l => new LedgerS2Dto
        {
            Id = l.Id,
            ProductId = l.ProductId,
            ProductName = l.Product.Name,
            Date = l.Date,
            Type = l.Type,
            DocumentRef = l.Receipt?.ReceiptCode ?? 
                          (l.ReceiptId.HasValue && orderCodes.ContainsKey(l.ReceiptId.Value) 
                              ? orderCodes[l.ReceiptId.Value] 
                              : "Auto"),
            QuantityIn = l.QuantityIn,
            ValueIn = l.ValueIn,
            QuantityOut = l.QuantityOut,
            ValueOut = l.ValueOut,
            QuantityBalance = l.QuantityBalance,
            ValueBalance = l.ValueBalance
        }).ToList();
        
        var totalCount = records.Count;
        var pagedRecords = records.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();

        return new S2LedgerReportDto
        {
            OpeningQuantity = openingQuantity,
            OpeningValue = openingValue,
            TotalQuantityIn = records.Sum(r => r.QuantityIn),
            TotalValueIn = records.Sum(r => r.ValueIn),
            TotalQuantityOut = records.Sum(r => r.QuantityOut),
            TotalValueOut = records.Sum(r => r.ValueOut),
            ClosingQuantity = records.LastOrDefault()?.QuantityBalance ?? openingQuantity,
            ClosingValue = records.LastOrDefault()?.ValueBalance ?? openingValue,
            Records = new PagedResult<LedgerS2Dto>
            {
                Items = pagedRecords,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            }
        };
    }

    public async Task RecordExportForOrderAsync(Guid tenantId, Guid orderId, Guid productId, decimal quantity, string description, CancellationToken cancellationToken = default)
    {
        var tenant = await _context.Tenants.FirstOrDefaultAsync(t => t.Id == tenantId);
        var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == productId);
        
        if (tenant == null || product == null) return;

        var lastLedger = await _context.AccountingLedgerS2s
            .Where(l => l.TenantId == tenantId && l.ProductId == productId)
            .OrderByDescending(l => l.Date)
            .FirstOrDefaultAsync(cancellationToken);

        var prevQty = lastLedger?.QuantityBalance ?? 0;
        var prevVal = lastLedger?.ValueBalance ?? 0;

        var ledgerEntry = new AccountingLedgerS2
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            ProductId = productId,
            Date = DateTime.UtcNow,
            Type = ReceiptType.Export,
            QuantityOut = quantity,
            ReceiptId = orderId
        };

        if (tenant.CogsMethod == CogsMethod.WeightedAverage)
        {
            var unitCost = prevQty > 0 ? prevVal / prevQty : 0;
            ledgerEntry.ValueOut = quantity * unitCost;
        }
        else
        {
            // Fallback for FIFO currently
            var unitCost = prevQty > 0 ? prevVal / prevQty : 0;
            ledgerEntry.ValueOut = quantity * unitCost;
        }

        ledgerEntry.QuantityBalance = prevQty - quantity;
        ledgerEntry.ValueBalance = prevVal - ledgerEntry.ValueOut;

        _context.AccountingLedgerS2s.Add(ledgerEntry);
    }

    public async Task RecordImportForReturnAsync(Guid tenantId, Guid orderId, Guid productId, decimal quantity, string description, CancellationToken cancellationToken = default)
    {
        var tenant = await _context.Tenants.FirstOrDefaultAsync(t => t.Id == tenantId);
        var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == productId);
        
        if (tenant == null || product == null) return;

        var lastLedger = await _context.AccountingLedgerS2s
            .Where(l => l.TenantId == tenantId && l.ProductId == productId)
            .OrderByDescending(l => l.Date)
            .FirstOrDefaultAsync(cancellationToken);

        var prevQty = lastLedger?.QuantityBalance ?? 0;
        var prevVal = lastLedger?.ValueBalance ?? 0;

        var ledgerEntry = new AccountingLedgerS2
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            ProductId = productId,
            Date = DateTime.UtcNow,
            Type = ReceiptType.Import,
            QuantityIn = quantity
        };

        var unitCost = prevQty > 0 ? prevVal / prevQty : 0;
        ledgerEntry.ValueIn = quantity * unitCost;

        ledgerEntry.QuantityBalance = prevQty + quantity;
        ledgerEntry.ValueBalance = prevVal + ledgerEntry.ValueIn;

        _context.AccountingLedgerS2s.Add(ledgerEntry);
    }

    private ReceiptDto MapToDto(InventoryReceipt r)
    {
        return new ReceiptDto
        {
            Id = r.Id,
            ReceiptCode = r.ReceiptCode,
            Type = r.Type,
            Date = r.Date,
            TotalAmount = r.TotalAmount,
            TotalVatAmount = r.TotalVatAmount,
            TotalCostPrice = r.Type == ReceiptType.Export ? r.TotalAmount : 0,
            Note = r.Note,
            DelivererReceiverName = r.DelivererReceiverName,
            ReferenceDocumentNo = r.ReferenceDocumentNo,
            ReferenceDocumentDate = r.ReferenceDocumentDate,
            ReferenceDocumentIssuer = r.ReferenceDocumentIssuer,
            WarehouseLocation = r.WarehouseLocation,
            Status = r.Status,
            CancelReason = r.CancelReason,
            CancelledAt = r.CancelledAt,
            Details = r.Details.Select(d => new ReceiptDetailDto
            {
                ProductId = d.ProductId,
                ProductName = d.Product?.Name ?? "",
                DocumentQuantity = d.DocumentQuantity,
                Quantity = d.Quantity,
                UnitPrice = d.UnitPrice,
                TotalPrice = d.TotalPrice,
                VatRate = d.VatRate,
                VatAmount = d.VatAmount
            }).ToList()
        };
    }

    public async Task<decimal> GetCostPriceAsync(Guid tenantId, Guid productId)
    {
        var lastLedger = await _context.AccountingLedgerS2s
            .Where(l => l.TenantId == tenantId && l.ProductId == productId)
            .OrderByDescending(l => l.Date)
            .FirstOrDefaultAsync();

        var prevQty = lastLedger?.QuantityBalance ?? 0;
        var prevVal = lastLedger?.ValueBalance ?? 0;
        
        return prevQty > 0 ? prevVal / prevQty : 0;
    }
}
