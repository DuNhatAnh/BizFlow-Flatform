using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using BizFlow.Application.Common.Interfaces;
using BizFlow.Application.DTOs.Inventory;
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
                    UnitPrice = itemReq.UnitPrice,
                    TotalPrice = itemReq.Quantity * itemReq.UnitPrice
                };
                receipt.Details.Add(detail);
                totalAmount += detail.TotalPrice;

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

                    ledgerEntry.QuantityBalance = prevQty - itemReq.Quantity;
                    ledgerEntry.ValueBalance = prevVal - ledgerEntry.ValueOut;
                    
                    product.StockQuantity -= itemReq.Quantity;
                }

                _context.AccountingLedgerS2s.Add(ledgerEntry);
            }

            receipt.TotalAmount = totalAmount;
            _context.InventoryReceipts.Add(receipt);

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

    public async Task<List<ReceiptDto>> GetReceiptsAsync(Guid tenantId)
    {
        var receipts = await _context.InventoryReceipts
            .Include(r => r.Details)
                .ThenInclude(d => d.Product)
            .Where(r => r.TenantId == tenantId)
            .OrderByDescending(r => r.Date)
            .ToListAsync();

        return receipts.Select(MapToDto).ToList();
    }

    public async Task<S2LedgerReportDto> GetS2LedgerAsync(Guid tenantId, Guid productId, DateTime? startDate = null, DateTime? endDate = null)
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
        
        var records = ledgers.Select(l => new LedgerS2Dto
        {
            Id = l.Id,
            ProductId = l.ProductId,
            ProductName = l.Product.Name,
            Date = l.Date,
            Type = l.Type,
            DocumentRef = l.Receipt?.ReceiptCode ?? "Auto",
            QuantityIn = l.QuantityIn,
            ValueIn = l.ValueIn,
            QuantityOut = l.QuantityOut,
            ValueOut = l.ValueOut,
            QuantityBalance = l.QuantityBalance,
            ValueBalance = l.ValueBalance
        }).ToList();
        
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
            Records = records
        };
    }

    public async Task RecordExportForOrderAsync(Guid tenantId, Guid orderId, Guid productId, decimal quantity, string description, CancellationToken cancellationToken = default)
    {
        var tenant = await _context.Tenants.FindAsync(tenantId);
        var product = await _context.Products.FindAsync(productId);
        
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
            QuantityOut = quantity
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
        var tenant = await _context.Tenants.FindAsync(tenantId);
        var product = await _context.Products.FindAsync(productId);
        
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
                TotalPrice = d.TotalPrice
            }).ToList()
        };
    }
}
