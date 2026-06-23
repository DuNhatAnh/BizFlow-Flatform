using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BizFlow.Application.DTOs.Staff;
using BizFlow.Application.DTOs.Common;

namespace BizFlow.Application.Common.Interfaces;

public interface IStaffService
{
    Task<PagedResult<StaffDto>> GetStaffMembersAsync(Guid tenantId, int pageNumber = 1, int pageSize = 10, string? searchTerm = null);
    Task<StaffDto> CreateStaffAsync(Guid tenantId, CreateStaffRequest request);
    Task<bool> ToggleStaffStatusAsync(Guid tenantId, Guid staffId);
    Task<bool> ResetStaffPasswordAsync(Guid tenantId, Guid staffId, string newPassword);
    Task<IEnumerable<AuditLogDto>> GetStaffAuditLogsAsync(Guid tenantId, Guid staffId);
}
