using System;
using System.Threading.Tasks;
using BizFlow.Application.Interfaces;

namespace BizFlow.Infrastructure.Services;

public class NotificationService : INotificationService
{
    public Task SendToTenantAsync(Guid tenantId, string message)
    {
        // Mock implementation
        Console.WriteLine($"[Notification to Tenant {tenantId}]: {message}");
        return Task.CompletedTask;
    }

    public Task SendToUserAsync(Guid userId, string message)
    {
        // Mock implementation
        Console.WriteLine($"[Notification to User {userId}]: {message}");
        return Task.CompletedTask;
    }
}
