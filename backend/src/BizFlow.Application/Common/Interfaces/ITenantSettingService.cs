using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace BizFlow.Application.Common.Interfaces;

public interface ITenantSettingService
{
    Task<T?> GetSettingAsync<T>(string key, CancellationToken cancellationToken = default);
    Task<string?> GetSettingStringAsync(string key, CancellationToken cancellationToken = default);
    Task<Dictionary<string, string>> GetAllSettingsAsync(CancellationToken cancellationToken = default);
    Task SetSettingsAsync(Dictionary<string, string> settings, Guid updatedBy, CancellationToken cancellationToken = default);
    Task RemoveSettingAsync(string key, Guid updatedBy, CancellationToken cancellationToken = default);
}
