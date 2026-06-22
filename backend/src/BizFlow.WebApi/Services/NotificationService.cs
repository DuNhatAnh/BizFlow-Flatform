using System;
using System.Threading.Tasks;
using BizFlow.Application.Interfaces;
using BizFlow.WebApi.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace BizFlow.WebApi.Services;

public class NotificationService : INotificationService
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public NotificationService(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task SendToTenantAsync(Guid tenantId, string message)
    {
        await _hubContext.Clients.Group(tenantId.ToString()).SendAsync("ReceiveNotification", message);
    }

    public async Task SendToUserAsync(Guid userId, string message)
    {
        // For simplicity, we assume user IDs can be mapped if needed,
        // but for now we just use SendToTenantAsync mostly.
        await _hubContext.Clients.User(userId.ToString()).SendAsync("ReceiveNotification", message);
    }
}
