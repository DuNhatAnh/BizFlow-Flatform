using BizFlow.Domain.Entities;

namespace BizFlow.Application.Common.Interfaces;

public interface IOrderService
{
    Task<Order> CreateOrderAsync(Order order, CancellationToken cancellationToken = default);
    Task<Order> CancelOrderAsync(Guid orderId, Guid tenantId, CancellationToken cancellationToken = default);
    Task<Order> ConfirmDraftOrderAsync(Guid orderId, Order updatedOrder, CancellationToken cancellationToken = default);
}
