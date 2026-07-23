using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using BizFlow.Application.Common.Interfaces;
using BizFlow.Domain.Constants;
using BizFlow.Domain.Entities;

namespace BizFlow.Infrastructure.Services;

public class TenantSettingService : ITenantSettingService
{
    private readonly IApplicationDbContext _context;
    private readonly IDistributedCache _cache;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly ILogger<TenantSettingService> _logger;

    public TenantSettingService(
        IApplicationDbContext context,
        IDistributedCache cache,
        ICurrentTenantService currentTenantService,
        ILogger<TenantSettingService> logger)
    {
        _context = context;
        _cache = cache;
        _currentTenantService = currentTenantService;
        _logger = logger;
    }

    private string GetCacheKey(Guid tenantId) => $"tenant_settings_{tenantId}";

    public async Task<T?> GetSettingAsync<T>(string key, CancellationToken cancellationToken = default)
    {
        var strValue = await GetSettingStringAsync(key, cancellationToken);
        if (strValue == null) return default;
        
        try
        {
            if (typeof(T) == typeof(string)) return (T)(object)strValue;
            return JsonSerializer.Deserialize<T>(strValue);
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Failed to deserialize setting {Key} to type {Type}", key, typeof(T).Name);
            return default;
        }
    }

    public async Task<string?> GetSettingStringAsync(string key, CancellationToken cancellationToken = default)
    {
        var settings = await GetAllSettingsAsync(cancellationToken);
        if (settings.TryGetValue(key, out var value))
        {
            return value;
        }

        // Fallback to defaults
        if (TenantSettingKeys.Defaults.TryGetValue(key, out var defaultValue))
        {
            return defaultValue;
        }

        return null;
    }

    public async Task<Dictionary<string, string>> GetAllSettingsAsync(CancellationToken cancellationToken = default)
    {
        var tenantId = _currentTenantService.TenantId;
        if (tenantId == null) return new Dictionary<string, string>();

        var cacheKey = GetCacheKey(tenantId.Value);
        
        try
        {
            var cachedData = await _cache.GetStringAsync(cacheKey, cancellationToken);
            if (!string.IsNullOrEmpty(cachedData))
            {
                try
                {
                    var dict = JsonSerializer.Deserialize<Dictionary<string, string>>(cachedData);
                    if (dict != null) return dict;
                }
                catch (JsonException ex)
                {
                    _logger.LogError(ex, "Failed to deserialize TenantSettings for TenantId: {Id}. Data corrupted in Cache.", tenantId);
                    // Remove corrupted cache and fallback to DB
                    await _cache.RemoveAsync(cacheKey, cancellationToken);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Redis exception when fetching TenantSettings for TenantId: {Id}. Falling back to Database.", tenantId);
        }

        // Fallback to DB
        var dbSettings = await _context.TenantSettings
            .Where(x => x.TenantId == tenantId.Value)
            .ToDictionaryAsync(x => x.Key, x => x.Value, cancellationToken);

        // Try to save to cache for next time
        try
        {
            var json = JsonSerializer.Serialize(dbSettings);
            // Using IDistributedCache without expiration options creates a no-expiration key
            await _cache.SetStringAsync(cacheKey, json, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Redis exception when setting TenantSettings for TenantId: {Id}.", tenantId);
        }

        return dbSettings;
    }

    public async Task SetSettingsAsync(Dictionary<string, string> settings, Guid updatedBy, CancellationToken cancellationToken = default)
    {
        var tenantId = _currentTenantService.TenantId;
        if (tenantId == null) throw new UnauthorizedAccessException("Tenant ID is required.");

        var existingSettings = await _context.TenantSettings
            .Where(x => x.TenantId == tenantId.Value)
            .ToListAsync(cancellationToken);

        foreach (var kvp in settings)
        {
            var existing = existingSettings.FirstOrDefault(x => x.Key == kvp.Key);
            if (existing != null)
            {
                existing.Value = kvp.Value;
                existing.UpdatedAt = DateTime.UtcNow;
                existing.UpdatedBy = updatedBy;
            }
            else
            {
                _context.TenantSettings.Add(new TenantSetting
                {
                    TenantId = tenantId.Value,
                    Key = kvp.Key,
                    Value = kvp.Value,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    UpdatedBy = updatedBy
                });
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
        
        // Invalidate cache
        try
        {
            await _cache.RemoveAsync(GetCacheKey(tenantId.Value), cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to invalidate TenantSettings cache for TenantId: {Id}.", tenantId);
        }
    }

    public async Task RemoveSettingAsync(string key, Guid updatedBy, CancellationToken cancellationToken = default)
    {
        var tenantId = _currentTenantService.TenantId;
        if (tenantId == null) throw new UnauthorizedAccessException("Tenant ID is required.");

        var existing = await _context.TenantSettings
            .FirstOrDefaultAsync(x => x.TenantId == tenantId.Value && x.Key == key, cancellationToken);

        if (existing != null)
        {
            _context.TenantSettings.Remove(existing);
            await _context.SaveChangesAsync(cancellationToken);

            // Invalidate cache
            try
            {
                await _cache.RemoveAsync(GetCacheKey(tenantId.Value), cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to invalidate TenantSettings cache for TenantId: {Id}.", tenantId);
            }
        }
    }
}
