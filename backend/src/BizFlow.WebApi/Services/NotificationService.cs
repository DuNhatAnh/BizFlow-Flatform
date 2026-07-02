using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using BizFlow.Application.Interfaces;
using BizFlow.Application.Common.Interfaces;
using BizFlow.Domain.Entities;
using BizFlow.WebApi.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace BizFlow.WebApi.Services;

public class NotificationService : INotificationService
{
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly IApplicationDbContext _context;

    public NotificationService(IHubContext<NotificationHub> hubContext, IApplicationDbContext context)
    {
        _hubContext = hubContext;
        _context = context;
    }

    public async Task SendToTenantAsync(Guid tenantId, string message)
    {
        await _hubContext.Clients.Group(tenantId.ToString()).SendAsync("ReceiveNotification", message);
    }

    public async Task SendToUserAsync(Guid userId, string message)
    {
        await _hubContext.Clients.Group($"user_{userId}").SendAsync("ReceiveNotification", message);
    }

    public async Task<List<Notification>> GetUserNotificationsAsync(Guid userId)
    {
        return await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .ToListAsync();
    }

    public async Task<int> GetUnreadCountAsync(Guid userId)
    {
        return await _context.Notifications
            .CountAsync(n => n.UserId == userId && !n.IsRead);
    }

    public async Task MarkAsReadAsync(Guid notificationId)
    {
        var notification = await _context.Notifications.FirstOrDefaultAsync(n => n.Id == notificationId);
        if (notification != null)
        {
            notification.IsRead = true;
            _context.Notifications.Update(notification);
            await _context.SaveChangesAsync(default);
        }
    }

    public async Task CreateNotificationAsync(Guid tenantId, Guid userId, string title, string message, string type)
    {
        var notification = new Notification
        {
            TenantId = tenantId,
            UserId = userId,
            Title = title,
            Message = message,
            Type = type,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync(default);

        // Also push via SignalR using user group
        await _hubContext.Clients.Group($"user_{userId}").SendAsync("ReceiveNotification", new {
            Id = notification.Id,
            Title = title,
            Message = message,
            Type = type,
            CreatedAt = notification.CreatedAt
        });
    }
}
