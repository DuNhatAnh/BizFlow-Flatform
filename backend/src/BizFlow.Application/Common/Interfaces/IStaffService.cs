using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BizFlow.Application.DTOs.Staff;

namespace BizFlow.Application.Common.Interfaces;

public interface IStaffService
{
    Task<IEnumerable<StaffDto>> GetStaffMembersAsync(Guid tenantId);
    Task<StaffDto> CreateStaffAsync(Guid tenantId, CreateStaffRequest request);
    Task<bool> ToggleStaffStatusAsync(Guid tenantId, Guid staffId);
    Task<bool> ResetStaffPasswordAsync(Guid tenantId, Guid staffId, string newPassword);
    Task<IEnumerable<AuditLogDto>> GetStaffAuditLogsAsync(Guid tenantId, Guid staffId);
}
