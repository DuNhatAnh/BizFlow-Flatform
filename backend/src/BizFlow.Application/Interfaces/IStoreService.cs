using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using BizFlow.Application.DTOs.Store;

namespace BizFlow.Application.Interfaces;

public interface IStoreService
{
    Task<List<StoreDto>> GetStoresByTenantAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<StoreDto?> GetStoreByIdAsync(Guid tenantId, Guid storeId, CancellationToken cancellationToken = default);
    Task<StoreDto> UpdateStoreAsync(Guid tenantId, Guid storeId, UpdateStoreDto dto, CancellationToken cancellationToken = default);
    Task<StoreDto> CreateStoreAsync(Guid tenantId, UpdateStoreDto dto, CancellationToken cancellationToken = default);
}
