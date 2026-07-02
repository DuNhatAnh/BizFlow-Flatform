using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BizFlow.Application.DTOs.Staff;
using BizFlow.Application.DTOs.Common;

namespace BizFlow.Application.Common.Interfaces;

public interface IStaffService
{
    Task<PagedResult<PublicStaffDto>> GetStaffBasicAsync(Guid tenantId, int pageNumber = 1, int pageSize = 10, string? searchTerm = null);
    Task<PagedResult<StaffDetailDto>> GetStaffDetailAsync(Guid tenantId, int pageNumber = 1, int pageSize = 10, string? searchTerm = null);
    Task<PagedResult<StaffPayrollDto>> GetStaffPayrollAsync(Guid tenantId, int pageNumber = 1, int pageSize = 10, string? searchTerm = null);
    
    Task<StaffPayrollDto> CreateStaffAsync(Guid tenantId, CreateStaffRequest request);
    Task<bool> ToggleStaffStatusAsync(Guid tenantId, Guid staffId);
    Task<bool> ResetStaffPasswordAsync(Guid tenantId, Guid staffId, string newPassword);
    Task<StaffPayrollDto> UpdateStaffAsync(Guid tenantId, Guid staffId, UpdateStaffRequest request);
    Task<IEnumerable<AuditLogDto>> GetStaffAuditLogsAsync(Guid tenantId, Guid staffId);
}
