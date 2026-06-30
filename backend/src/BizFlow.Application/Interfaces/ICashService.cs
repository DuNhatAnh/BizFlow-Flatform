using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BizFlow.Application.DTOs.Cash;
using BizFlow.Application.DTOs.Common;

namespace BizFlow.Application.Interfaces;

public interface ICashService
{
    Task<PagedResult<CashTransactionDto>> GetTransactionsAsync(Guid tenantId, int pageNumber = 1, int pageSize = 10);
    Task<decimal> GetCashBalanceAsync(Guid tenantId);
    Task<CashTransactionDto> CreateTransactionAsync(Guid tenantId, CreateCashTransactionRequest request, Guid userId);
}
