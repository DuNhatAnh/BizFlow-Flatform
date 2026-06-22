using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BizFlow.Application.DTOs.Inventory;
using BizFlow.Domain.Enums;

namespace BizFlow.Application.Interfaces;

public interface IInventoryService
{
    Task<ReceiptDto> CreateReceiptAsync(Guid tenantId, CreateReceiptRequest request, Guid? userId = null);
    Task CancelReceiptAsync(Guid tenantId, Guid receiptId, CancelReceiptRequest request, Guid? userId = null);
    Task<List<ReceiptDto>> GetReceiptsAsync(Guid tenantId);
    Task<S2LedgerReportDto> GetS2LedgerAsync(Guid tenantId, Guid productId, DateTime? startDate = null, DateTime? endDate = null);
    
    // Called by OrderService when an order is completed/cancelled
    Task RecordExportForOrderAsync(Guid tenantId, Guid orderId, Guid productId, decimal quantity, string description, CancellationToken cancellationToken = default);
}
