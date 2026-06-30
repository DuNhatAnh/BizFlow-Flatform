using Microsoft.EntityFrameworkCore;
using BizFlow.Application.Common.Interfaces;
using BizFlow.Application.Interfaces;
using BizFlow.Domain.Entities;
using BizFlow.Domain.Enums;

namespace BizFlow.Infrastructure.Services;

public class OrderService : IOrderService
{
    private readonly IApplicationDbContext _context;
    private readonly INotificationService _notificationService;
    private readonly IInventoryService _inventoryService;

    public OrderService(IApplicationDbContext context, INotificationService notificationService, IInventoryService inventoryService)
    {
        _context = context;
        _notificationService = notificationService;
        _inventoryService = inventoryService;
    }

    public async Task<Order> CreateOrderAsync(Order order, CancellationToken cancellationToken = default)
    {
        // 1. Debt validation constraint
        if (order.PaymentMethod == PaymentMethod.Debt)
        {
            if (order.CustomerId == null || order.CustomerId == Guid.Empty)
            {
                throw new ArgumentException("Vui lòng chọn khách hàng đăng ký để thực hiện ghi nợ");
            }
        }

        using var transaction = await _context.BeginTransactionAsync(cancellationToken);
        try
        {
            order.CreatedAt = DateTime.UtcNow;
            order.Status = OrderStatus.Completed;
            order.Code = await GenerateOrderCodeAsync(order.TenantId, cancellationToken);

            decimal calculatedTotalAmount = 0;
            decimal calculatedTotalVat = 0;

            // Process order items
            foreach (var item in order.OrderItems)
            {
                // Fetch conversion rate and unit details
                var unit = await _context.ProductUnits
                    .FirstOrDefaultAsync(pu => pu.Id == item.ProductUnitId && pu.ProductId == item.ProductId, cancellationToken);

                if (unit == null)
                {
                    throw new InvalidOperationException($"Không tìm thấy đơn vị tính ID {item.ProductUnitId} cho sản phẩm {item.ProductId}");
                }

                var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == item.ProductId && p.TenantId == order.TenantId, cancellationToken);
                if (product == null) throw new InvalidOperationException($"Không tìm thấy sản phẩm ID {item.ProductId}");

                item.UnitPrice = unit.Price;
                var qty = item.Quantity;
                var rateStr = product.VatRate;
                var rate = rateStr == "KCT" ? 0 : (decimal.TryParse(rateStr, out var r) ? r : 0);
                var includesVat = product.PriceIncludesVat;

                item.VatRate = rateStr;

                if (includesVat) {
                    var lineTotal = unit.Price * qty;
                    var lineSubtotal = lineTotal / (1 + rate / 100m);
                    item.VatAmount = lineTotal - lineSubtotal;
                    item.TotalPrice = lineTotal;
                } else {
                    var lineSubtotal = unit.Price * qty;
                    item.VatAmount = lineSubtotal * (rate / 100m);
                    item.TotalPrice = lineSubtotal + item.VatAmount;
                }
                
                calculatedTotalAmount += item.TotalPrice;
                calculatedTotalVat += item.VatAmount;

                var baseQty = item.Quantity * unit.ConversionRate;

                // Validate and deduct stock
                if (product.StockQuantity < baseQty)
                {
                    throw new InvalidOperationException($"Sản phẩm '{product.Name}' đã hết hàng hoặc không đủ số lượng (Tồn kho: {product.StockQuantity}, Yêu cầu: {baseQty}). Vui lòng cập nhật phiếu nhập kho.");
                }
                product.StockQuantity -= baseQty;

                // 2. Deduct inventory: Insert InventoryTransaction (Type = Export)
                var invTx = new InventoryTransaction
                {
                    Id = Guid.NewGuid(),
                    TenantId = order.TenantId,
                    ProductId = item.ProductId,
                    Type = InventoryTransactionType.Export,
                    Quantity = baseQty,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = order.CreatedBy,
                    Note = $"Xuất kho bán hàng - Đơn hàng {order.Id}"
                };
                _context.InventoryTransactions.Add(invTx);

                await _inventoryService.RecordExportForOrderAsync(order.TenantId, order.Id, item.ProductId, baseQty, invTx.Note, cancellationToken);
            }

            order.TotalAmount = calculatedTotalAmount;
            order.TotalVatAmount = calculatedTotalVat;

            // 3. Customer debt processing
            if (order.PaymentMethod == PaymentMethod.Debt && order.CustomerId != null)
            {
                var customer = await _context.Customers
                    .FirstOrDefaultAsync(c => c.Id == order.CustomerId && c.TenantId == order.TenantId, cancellationToken);

                if (customer == null)
                {
                    throw new InvalidOperationException("Không tìm thấy khách hàng được gán cho đơn hàng ghi nợ");
                }

                customer.TotalDebt += order.TotalAmount;

                var debtTx = new DebtTransaction
                {
                    Id = Guid.NewGuid(),
                    TenantId = order.TenantId,
                    CustomerId = customer.Id,
                    OrderId = order.Id,
                    Type = DebtTransactionType.Increase,
                    Amount = order.TotalAmount,
                    CreatedAt = DateTime.UtcNow
                };
                _context.DebtTransactions.Add(debtTx);
            }

            // 4. Create accounting entry (Circular 88)
            var accountingEntry = new AccountingEntry
            {
                Id = Guid.NewGuid(),
                TenantId = order.TenantId,
                TransactionDate = DateTime.UtcNow,
                DocumentType = DocumentType.Sales,
                DocumentRefId = order.Id.ToString(),
                AccountCategory = AccountCategory.Revenue_Goods,
                Amount = order.TotalAmount,
                Description = $"Doanh thu bán hàng - Đơn hàng #{order.Id.ToString().Substring(0, 8)}"
            };
            _context.AccountingEntries.Add(accountingEntry);

            // 5. If PaymentMethod is Cash or Transfer, create CashTransaction
            if (order.PaymentMethod == PaymentMethod.Cash || order.PaymentMethod == PaymentMethod.Transfer)
            {
                var prefix = "PT";
                var dateStr = DateTime.UtcNow.ToString("yyMMdd");
                
                // Need to count today's transactions for seq (simplified since we're in a transaction)
                var today = DateTime.UtcNow.Date;
                var countToday = await _context.CashTransactions
                    .Where(c => c.TenantId == order.TenantId && c.Type == CashTransactionType.Receipt && c.CreatedAt >= today)
                    .CountAsync(cancellationToken);
                    
                var seq = (countToday + 1).ToString("D3");
                var txCode = $"{prefix}-{dateStr}-{seq}";

                var cashTx = new CashTransaction
                {
                    Id = Guid.NewGuid(),
                    TenantId = order.TenantId,
                    Type = CashTransactionType.Receipt,
                    PaymentMethod = order.PaymentMethod,
                    Amount = order.TotalAmount,
                    TransactionDate = DateTime.UtcNow,
                    TransactionCode = txCode,
                    Reason = $"Thu tiền bán hàng - Đơn hàng #{order.Code}",
                    ReferenceDocument = order.Code,
                    RelatedUserId = order.CreatedBy,
                    PayerReceiverName = order.CustomerId.HasValue ? "Khách hàng" : "Khách vãng lai",
                    CreatedAt = DateTime.UtcNow
                };
                _context.CashTransactions.Add(cashTx);
            }

            _context.Orders.Add(order);

            await _context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            return order;
        }
        catch (Exception)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task<Order> CancelOrderAsync(Guid orderId, Guid tenantId, CancellationToken cancellationToken = default)
    {
        using var transaction = await _context.BeginTransactionAsync(cancellationToken);
        try
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == orderId && o.TenantId == tenantId, cancellationToken);

            if (order == null)
            {
                throw new InvalidOperationException("Không tìm thấy đơn hàng cần hủy");
            }

            if (order.Status == OrderStatus.Cancelled)
            {
                throw new InvalidOperationException("Đơn hàng này đã được hủy trước đó");
            }

            order.Status = OrderStatus.Cancelled;

            // 1. Revert Inventory: add back stock with Type = Adjustment
            foreach (var item in order.OrderItems)
            {
                var unit = await _context.ProductUnits
                    .FirstOrDefaultAsync(pu => pu.Id == item.ProductUnitId && pu.ProductId == item.ProductId, cancellationToken);

                var conversionRate = unit?.ConversionRate ?? 1;
                var baseQty = item.Quantity * conversionRate;

                // Revert stock
                var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == item.ProductId && p.TenantId == order.TenantId, cancellationToken);
                if (product != null)
                {
                    product.StockQuantity += baseQty;
                }

                var invTx = new InventoryTransaction
                {
                    Id = Guid.NewGuid(),
                    TenantId = order.TenantId,
                    ProductId = item.ProductId,
                    Type = InventoryTransactionType.Adjustment,
                    Quantity = baseQty,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = order.CreatedBy,
                    Note = $"Hoàn kho do hủy đơn hàng {order.Id}"
                };
                _context.InventoryTransactions.Add(invTx);

                // Note: To properly revert LedgerS2, we could implement RecordImportForCancelAsync, but for now we'll just let InventoryTransaction be the truth.
            }

            // 2. Revert Customer Debt
            if (order.PaymentMethod == PaymentMethod.Debt && order.CustomerId != null)
            {
                var customer = await _context.Customers
                    .FirstOrDefaultAsync(c => c.Id == order.CustomerId && c.TenantId == order.TenantId, cancellationToken);

                if (customer != null)
                {
                    customer.TotalDebt -= order.TotalAmount;

                    var debtTx = new DebtTransaction
                    {
                        Id = Guid.NewGuid(),
                        TenantId = order.TenantId,
                        CustomerId = customer.Id,
                        OrderId = order.Id,
                        Type = DebtTransactionType.Decrease,
                        Amount = order.TotalAmount,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.DebtTransactions.Add(debtTx);
                }
            }

            // 3. Create reversing accounting entry (Negative amount)
            var accountingEntry = new AccountingEntry
            {
                Id = Guid.NewGuid(),
                TenantId = order.TenantId,
                TransactionDate = DateTime.UtcNow,
                DocumentType = DocumentType.Sales,
                DocumentRefId = order.Id.ToString(),
                AccountCategory = AccountCategory.Revenue_Goods,
                Amount = -order.TotalAmount,
                Description = $"Hủy doanh thu - Hủy đơn hàng #{order.Id.ToString().Substring(0, 8)}"
            };
            _context.AccountingEntries.Add(accountingEntry);

            await _context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            return order;
        }
        catch (Exception)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task<Order> ConfirmDraftOrderAsync(Guid orderId, Order updatedOrder, CancellationToken cancellationToken = default)
    {
        using var transaction = await _context.BeginTransactionAsync(cancellationToken);
        try
        {
            var draftOrder = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == orderId && o.TenantId == updatedOrder.TenantId, cancellationToken);

            if (draftOrder == null)
            {
                throw new InvalidOperationException("Không tìm thấy đơn hàng nháp");
            }

            if (draftOrder.Status != OrderStatus.Draft)
            {
                throw new InvalidOperationException("Đơn hàng này không phải là đơn nháp");
            }

            // Update simple fields
            draftOrder.CustomerId = updatedOrder.CustomerId;
            draftOrder.PaymentMethod = updatedOrder.PaymentMethod;
            draftOrder.CreatedBy = updatedOrder.CreatedBy;

            // Validation for debt
            if (draftOrder.PaymentMethod == PaymentMethod.Debt && (draftOrder.CustomerId == null || draftOrder.CustomerId == Guid.Empty))
            {
                throw new ArgumentException("Vui lòng chọn khách hàng đăng ký để thực hiện ghi nợ");
            }

            // Remove old draft items
            _context.OrderItems.RemoveRange(draftOrder.OrderItems);
            draftOrder.OrderItems.Clear();

            decimal calculatedTotalAmount = 0;

            // Re-populate order items
            foreach (var item in updatedOrder.OrderItems)
            {
                var unit = await _context.ProductUnits
                    .FirstOrDefaultAsync(pu => pu.Id == item.ProductUnitId && pu.ProductId == item.ProductId, cancellationToken);

                if (unit == null)
                {
                    throw new InvalidOperationException($"Không tìm thấy đơn vị tính ID {item.ProductUnitId} cho sản phẩm {item.ProductId}");
                }

                var newItem = new OrderItem
                {
                    OrderId = draftOrder.Id,
                    ProductId = item.ProductId,
                    ProductUnitId = item.ProductUnitId,
                    Quantity = item.Quantity,
                    UnitPrice = unit.Price,
                    TotalPrice = unit.Price * item.Quantity
                };

                draftOrder.OrderItems.Add(newItem);
                calculatedTotalAmount += newItem.TotalPrice;

                var baseQty = item.Quantity * unit.ConversionRate;

                // Validate and deduct stock
                var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == item.ProductId && p.TenantId == draftOrder.TenantId, cancellationToken);
                if (product == null) throw new InvalidOperationException($"Không tìm thấy sản phẩm ID {item.ProductId}");
                if (product.StockQuantity < baseQty)
                {
                    throw new InvalidOperationException($"Sản phẩm '{product.Name}' đã hết hàng hoặc không đủ số lượng (Tồn kho: {product.StockQuantity}, Yêu cầu: {baseQty}). Vui lòng cập nhật phiếu nhập kho.");
                }
                product.StockQuantity -= baseQty;

                // Inventory deduction
                var invTx = new InventoryTransaction
                {
                    Id = Guid.NewGuid(),
                    TenantId = draftOrder.TenantId,
                    ProductId = item.ProductId,
                    Type = InventoryTransactionType.Export,
                    Quantity = baseQty,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = draftOrder.CreatedBy,
                    Note = $"Xuất kho bán hàng - Duyệt đơn nháp {draftOrder.Id}"
                };
                _context.InventoryTransactions.Add(invTx);

                await _inventoryService.RecordExportForOrderAsync(draftOrder.TenantId, draftOrder.Id, item.ProductId, baseQty, invTx.Note, cancellationToken);
            }

            draftOrder.TotalAmount = calculatedTotalAmount;
            draftOrder.Status = OrderStatus.Completed;
            if (string.IsNullOrEmpty(draftOrder.Code))
            {
                draftOrder.Code = await GenerateOrderCodeAsync(draftOrder.TenantId, cancellationToken);
            }

            // Customer debt processing
            if (draftOrder.PaymentMethod == PaymentMethod.Debt && draftOrder.CustomerId != null)
            {
                var customer = await _context.Customers
                    .FirstOrDefaultAsync(c => c.Id == draftOrder.CustomerId && c.TenantId == draftOrder.TenantId, cancellationToken);

                if (customer == null)
                {
                    throw new InvalidOperationException("Không tìm thấy khách hàng được gán cho đơn hàng ghi nợ");
                }

                customer.TotalDebt += draftOrder.TotalAmount;

                var debtTx = new DebtTransaction
                {
                    Id = Guid.NewGuid(),
                    TenantId = draftOrder.TenantId,
                    CustomerId = customer.Id,
                    OrderId = draftOrder.Id,
                    Type = DebtTransactionType.Increase,
                    Amount = draftOrder.TotalAmount,
                    CreatedAt = DateTime.UtcNow
                };
                _context.DebtTransactions.Add(debtTx);
            }

            // Create accounting entry
            var accountingEntry = new AccountingEntry
            {
                Id = Guid.NewGuid(),
                TenantId = draftOrder.TenantId,
                TransactionDate = DateTime.UtcNow,
                DocumentType = DocumentType.Sales,
                DocumentRefId = draftOrder.Id.ToString(),
                AccountCategory = AccountCategory.Revenue_Goods,
                Amount = draftOrder.TotalAmount,
                Description = $"Doanh thu bán hàng - Duyệt đơn nháp #{draftOrder.Id.ToString().Substring(0, 8)}"
            };
            _context.AccountingEntries.Add(accountingEntry);

            await _context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            return draftOrder;
        }
        catch (Exception)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task<Order> ReturnOrderAsync(Guid orderId, Guid tenantId, List<ReturnOrderItemDto> returnItems, Guid performedBy, CancellationToken cancellationToken = default)
    {
        using var transaction = await _context.BeginTransactionAsync(cancellationToken);
        try
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == orderId && o.TenantId == tenantId, cancellationToken);

            if (order == null)
            {
                throw new InvalidOperationException("Không tìm thấy đơn hàng");
            }

            if (order.Status == OrderStatus.Cancelled)
            {
                throw new InvalidOperationException("Đơn hàng đã bị hủy hoặc đã được trả lại hoàn toàn trước đó");
            }

            decimal refundAmount = 0;

            foreach (var returnItem in returnItems)
            {
                if (returnItem.ReturnQuantity <= 0) continue;

                var orderItem = order.OrderItems.FirstOrDefault(oi => oi.ProductId == returnItem.ProductId && oi.ProductUnitId == returnItem.ProductUnitId);
                if (orderItem == null)
                {
                    throw new InvalidOperationException($"Không tìm thấy sản phẩm trong đơn hàng gốc");
                }

                if (returnItem.ReturnQuantity > orderItem.Quantity)
                {
                    throw new InvalidOperationException($"Số lượng trả lại ({returnItem.ReturnQuantity}) vượt quá số lượng còn lại trong đơn ({orderItem.Quantity})");
                }

                var unit = await _context.ProductUnits
                    .FirstOrDefaultAsync(pu => pu.Id == orderItem.ProductUnitId && pu.ProductId == orderItem.ProductId, cancellationToken);
                var conversionRate = unit?.ConversionRate ?? 1;
                var baseReturnQty = returnItem.ReturnQuantity * conversionRate;

                // 1. Revert stock quantity
                var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == orderItem.ProductId && p.TenantId == tenantId, cancellationToken);
                if (product != null)
                {
                    product.StockQuantity += baseReturnQty;
                }

                // 2. Add inventory transaction
                var invTx = new InventoryTransaction
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    ProductId = orderItem.ProductId,
                    Type = InventoryTransactionType.Adjustment,
                    Quantity = baseReturnQty,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = performedBy,
                    Note = $"Nhập kho trả hàng - Đơn hàng {order.Id}"
                };
                _context.InventoryTransactions.Add(invTx);

                // 3. Sync to S2 Ledger
                await _inventoryService.RecordImportForReturnAsync(tenantId, order.Id, orderItem.ProductId, baseReturnQty, invTx.Note, cancellationToken);

                refundAmount += returnItem.ReturnQuantity * orderItem.UnitPrice;

                // 4. Update order item quantity and total price
                orderItem.Quantity -= returnItem.ReturnQuantity;
                orderItem.TotalPrice = orderItem.UnitPrice * orderItem.Quantity;
            }

            if (refundAmount <= 0)
            {
                throw new InvalidOperationException("Không có hàng hóa nào được chọn để trả lại");
            }

            // 5. Update order total amount
            order.TotalAmount -= refundAmount;

            // If all items are returned (all quantities are 0), mark order as Cancelled
            if (order.OrderItems.All(oi => oi.Quantity == 0))
            {
                order.Status = OrderStatus.Cancelled;
            }

            // 6. Customer debt reduction (if debt order)
            if (order.PaymentMethod == PaymentMethod.Debt && order.CustomerId != null)
            {
                var customer = await _context.Customers
                    .FirstOrDefaultAsync(c => c.Id == order.CustomerId && c.TenantId == tenantId, cancellationToken);

                if (customer != null)
                {
                    customer.TotalDebt -= refundAmount;

                    var debtTx = new DebtTransaction
                    {
                        Id = Guid.NewGuid(),
                        TenantId = tenantId,
                        CustomerId = customer.Id,
                        OrderId = order.Id,
                        Type = DebtTransactionType.Decrease,
                        Amount = refundAmount,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.DebtTransactions.Add(debtTx);
                }
            }

            // 7. Create reversing accounting entry (Negative amount) for Circular 88
            var accountingEntry = new AccountingEntry
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                TransactionDate = DateTime.UtcNow,
                DocumentType = DocumentType.Sales,
                DocumentRefId = order.Id.ToString(),
                AccountCategory = AccountCategory.Revenue_Goods,
                Amount = -refundAmount,
                Description = $"Giảm trừ doanh thu trả hàng - Đơn hàng #{order.Id.ToString().Substring(0, 8)}"
            };
            _context.AccountingEntries.Add(accountingEntry);

            // 8. Log audit action
            var log = new AuditLog
            {
                TenantId = tenantId,
                UserId = performedBy,
                Action = "RETURN_ORDER",
                EntityName = "Order",
                EntityId = order.Id.ToString(),
                Details = $"Trả hàng nhanh tại quầy cho đơn hàng #{order.Id.ToString().Substring(0, 8)}. Tổng tiền hoàn trả: {refundAmount:N0}đ."
            };
            _context.AuditLogs.Add(log);

            // 9. Dispatch owner notification
            try
            {
                await _notificationService.SendToTenantAsync(tenantId, $"Đơn hàng #{order.Id.ToString().Substring(0, 8)} đã được đổi trả một phần/toàn bộ hàng hóa bởi nhân viên. Số tiền hoàn trả: {refundAmount:N0}đ.");
            }
            catch
            {
                // Soft fail on notification to avoid blocking business transaction
            }

            await _context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            return order;
        }
        catch (Exception)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    private async Task<string> GenerateOrderCodeAsync(Guid tenantId, CancellationToken cancellationToken)
    {
        var todayStr = DateTime.UtcNow.ToString("ddMMyy");
        var todayStart = DateTime.UtcNow.Date;
        var todayEnd = todayStart.AddDays(1);
        var count = await _context.Orders
            .Where(o => o.TenantId == tenantId && o.CreatedAt >= todayStart && o.CreatedAt < todayEnd && !string.IsNullOrEmpty(o.Code))
            .CountAsync(cancellationToken);
        return $"HD{todayStr}-{(count + 1):D3}";
    }
}
