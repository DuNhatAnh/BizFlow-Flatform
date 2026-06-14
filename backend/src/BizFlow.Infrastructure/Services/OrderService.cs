using Microsoft.EntityFrameworkCore;
using BizFlow.Application.Common.Interfaces;
using BizFlow.Domain.Entities;
using BizFlow.Domain.Enums;

namespace BizFlow.Infrastructure.Services;

public class OrderService : IOrderService
{
    private readonly IApplicationDbContext _context;

    public OrderService(IApplicationDbContext context)
    {
        _context = context;
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

            decimal calculatedTotalAmount = 0;

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

                item.UnitPrice = unit.Price;
                item.TotalPrice = unit.Price * item.Quantity;
                calculatedTotalAmount += item.TotalPrice;

                // 2. Deduct inventory: Insert InventoryTransaction (Type = Export)
                var baseQty = item.Quantity * unit.ConversionRate;
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
            }

            order.TotalAmount = calculatedTotalAmount;

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

                // Inventory deduction
                var baseQty = item.Quantity * unit.ConversionRate;
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
            }

            draftOrder.TotalAmount = calculatedTotalAmount;
            draftOrder.Status = OrderStatus.Completed;

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
}
