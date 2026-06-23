using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BizFlow.Application.DTOs.Inventory;
using BizFlow.Application.DTOs.Common;
using BizFlow.Domain.Enums;

namespace BizFlow.Application.Interfaces;

public interface IInventoryService
{
    Task<ReceiptDto> CreateReceiptAsync(Guid tenantId, CreateReceiptRequest request, Guid? userId = null);
    Task CancelReceiptAsync(Guid tenantId, Guid receiptId, CancelReceiptRequest request, Guid? userId = null);
    Task<PagedResult<ReceiptDto>> GetReceiptsAsync(Guid tenantId, int type = -1, int pageNumber = 1, int pageSize = 10);
    Task<S2LedgerReportDto> GetS2LedgerAsync(Guid tenantId, Guid productId, DateTime? startDate = null, DateTime? endDate = null, int pageNumber = 1, int pageSize = 10);
    
    // Called by OrderService when an order is completed/cancelled
    Task RecordExportForOrderAsync(Guid tenantId, Guid orderId, Guid productId, decimal quantity, string description, CancellationToken cancellationToken = default);
}
