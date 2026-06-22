using System;
using System.Threading.Tasks;

namespace BizFlow.Application.Interfaces;

public interface INotificationService
{
    Task SendToTenantAsync(Guid tenantId, string message);
    Task SendToUserAsync(Guid userId, string message);
}
