using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BizFlow.Domain.Entities;

namespace BizFlow.Application.Interfaces;

public interface INotificationService
{
    Task SendToTenantAsync(Guid tenantId, string message);
    Task SendToUserAsync(Guid userId, string message);
    
    // New methods for Database-backed notifications
    Task<List<Notification>> GetUserNotificationsAsync(Guid userId);
    Task<int> GetUnreadCountAsync(Guid userId);
    Task MarkAsReadAsync(Guid notificationId);
    Task CreateNotificationAsync(Guid tenantId, Guid userId, string title, string message, string type);
}
