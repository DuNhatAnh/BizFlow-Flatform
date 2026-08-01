using System;
using System.Threading.Tasks;

namespace BizFlow.Application.Interfaces;

public interface ITenantManagementService
{
    Task ApproveTenantUpgradeAsync(Guid tenantId);
    Task ChangeSubscriptionAsync(Guid tenantId, int? planId);
    Task UpdateSubscriptionEndDateAsync(Guid tenantId, DateTime? newEndDate);
}
