using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using BizFlow.Application.Common.Interfaces;
using BizFlow.Application.DTOs.Store;
using BizFlow.Application.Interfaces;

namespace BizFlow.Infrastructure.Services;

public class StoreService : IStoreService
{
    private readonly IApplicationDbContext _context;

    public StoreService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<StoreDto>> GetStoresByTenantAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await _context.Stores
            .Where(s => s.TenantId == tenantId && s.IsActive)
            .Select(s => new StoreDto
            {
                Id = s.Id,
                Name = s.Name,
                Address = s.Address,
                Phone = s.Phone,
                TaxCode = s.TaxCode,
                Email = s.Email,
                LogoUrl = s.LogoUrl,
                IsActive = s.IsActive,
                EnableVat = s.EnableVat,
                DefaultVatRate = s.DefaultVatRate,
                AvailableVatRates = s.AvailableVatRates
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<StoreDto?> GetStoreByIdAsync(Guid tenantId, Guid storeId, CancellationToken cancellationToken = default)
    {
        var store = await _context.Stores
            .FirstOrDefaultAsync(s => s.TenantId == tenantId && s.Id == storeId && s.IsActive, cancellationToken);

        if (store == null) return null;

        return new StoreDto
        {
            Id = store.Id,
            Name = store.Name,
            Address = store.Address,
            Phone = store.Phone,
            TaxCode = store.TaxCode,
            Email = store.Email,
            LogoUrl = store.LogoUrl,
            IsActive = store.IsActive,
            EnableVat = store.EnableVat,
            DefaultVatRate = store.DefaultVatRate,
            AvailableVatRates = store.AvailableVatRates
        };
    }

    public async Task<StoreDto> UpdateStoreAsync(Guid tenantId, Guid storeId, UpdateStoreDto dto, CancellationToken cancellationToken = default)
    {
        var store = await _context.Stores
            .FirstOrDefaultAsync(s => s.TenantId == tenantId && s.Id == storeId, cancellationToken);

        if (store == null)
        {
            throw new Exception("Store not found or does not belong to the current tenant.");
        }

        store.Name = dto.Name;
        store.Address = dto.Address;
        store.Phone = dto.Phone;
        store.TaxCode = dto.TaxCode;
        store.Email = dto.Email;
        store.LogoUrl = dto.LogoUrl;
        
        if (dto.EnableVat.HasValue) store.EnableVat = dto.EnableVat.Value;
        if (dto.DefaultVatRate != null) store.DefaultVatRate = dto.DefaultVatRate;
        if (dto.AvailableVatRates != null) store.AvailableVatRates = dto.AvailableVatRates;

        await _context.SaveChangesAsync(cancellationToken);

        return new StoreDto
        {
            Id = store.Id,
            Name = store.Name,
            Address = store.Address,
            Phone = store.Phone,
            TaxCode = store.TaxCode,
            Email = store.Email,
            LogoUrl = store.LogoUrl,
            IsActive = store.IsActive,
            EnableVat = store.EnableVat,
            DefaultVatRate = store.DefaultVatRate,
            AvailableVatRates = store.AvailableVatRates
        };
    }

    public async Task<StoreDto> CreateStoreAsync(Guid tenantId, UpdateStoreDto dto, CancellationToken cancellationToken = default)
    {
        var store = new BizFlow.Domain.Entities.Store
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = dto.Name,
            Address = dto.Address,
            Phone = dto.Phone,
            TaxCode = dto.TaxCode,
            Email = dto.Email,
            LogoUrl = dto.LogoUrl,
            EnableVat = dto.EnableVat ?? false,
            DefaultVatRate = dto.DefaultVatRate ?? "10",
            AvailableVatRates = dto.AvailableVatRates ?? "0,5,8,8.5,10,KCT",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Stores.Add(store);
        await _context.SaveChangesAsync(cancellationToken);

        return new StoreDto
        {
            Id = store.Id,
            Name = store.Name,
            Address = store.Address,
            Phone = store.Phone,
            TaxCode = store.TaxCode,
            Email = store.Email,
            LogoUrl = store.LogoUrl,
            IsActive = store.IsActive,
            EnableVat = store.EnableVat,
            DefaultVatRate = store.DefaultVatRate,
            AvailableVatRates = store.AvailableVatRates
        };
    }
}
