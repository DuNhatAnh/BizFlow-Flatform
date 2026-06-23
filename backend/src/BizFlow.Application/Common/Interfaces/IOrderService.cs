using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using BizFlow.Domain.Entities;

namespace BizFlow.Application.Common.Interfaces;

public class ReturnOrderItemDto
{
    public Guid ProductId { get; set; }
    public int? ProductUnitId { get; set; }
    public decimal ReturnQuantity { get; set; }
}

public interface IOrderService
{
    Task<Order> CreateOrderAsync(Order order, CancellationToken cancellationToken = default);
    Task<Order> CancelOrderAsync(Guid orderId, Guid tenantId, CancellationToken cancellationToken = default);
    Task<Order> ConfirmDraftOrderAsync(Guid orderId, Order updatedOrder, CancellationToken cancellationToken = default);
    Task<Order> ReturnOrderAsync(Guid orderId, Guid tenantId, List<ReturnOrderItemDto> returnItems, Guid performedBy, CancellationToken cancellationToken = default);
}
