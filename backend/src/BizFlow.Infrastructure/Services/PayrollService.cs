using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using BizFlow.Application.Common.Interfaces;
using BizFlow.Application.DTOs.Common;
using BizFlow.Application.DTOs.Payroll;
using BizFlow.Domain.Entities;
using BizFlow.Domain.Enums;

namespace BizFlow.Infrastructure.Services;

public class PayrollService : IPayrollService
{
    private readonly IApplicationDbContext _context;

    public PayrollService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<PayrollDto>> GetPayrollRecordsAsync(Guid tenantId, int year, int month, int pageNumber = 1, int pageSize = 10)
    {
        var query = _context.PayrollRecords
            .Include(p => p.User)
                .ThenInclude(u => u.EmployeeProfile)
            .Where(p => p.TenantId == tenantId && p.Year == year && p.Month == month);

        var totalCount = await query.CountAsync();

        var records = await query
            .OrderBy(p => p.User.Fullname)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new PayrollDto
            {
                Id = p.Id,
                UserId = p.UserId,
                Fullname = p.User.Fullname,
                Username = p.User.Username,
                Year = p.Year,
                Month = p.Month,
                BaseSalary = p.BaseSalary,
                Allowances = p.Allowances,
                Deductions = p.Deductions,
                PersonalTax = p.BaseSalary > 0 
                    ? CalculatePersonalIncomeTax(p.BaseSalary, p.User.EmployeeProfile != null && p.User.EmployeeProfile.NumberOfDependents.HasValue ? p.User.EmployeeProfile.NumberOfDependents.Value : 0) 
                    : 0, 
                NetPay = p.NetPay,
                IsPaid = p.IsPaid,
                PaymentDate = p.PaymentDate,
                Note = p.Note,
                CreatedAt = p.CreatedAt,
                BankAccountNumber = p.User.EmployeeProfile != null ? p.User.EmployeeProfile.BankAccountNumber : null,
                BankName = p.User.EmployeeProfile != null ? p.User.EmployeeProfile.BankName : null,
                NumberOfDependents = p.User.EmployeeProfile != null && p.User.EmployeeProfile.NumberOfDependents.HasValue ? p.User.EmployeeProfile.NumberOfDependents.Value : 0
            })
            .ToListAsync();

        return new PagedResult<PayrollDto>
        {
            Items = records,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<IEnumerable<PayrollDto>> GeneratePayrollForMonthAsync(Guid tenantId, int year, int month)
    {
        // 1. Get all active employees for this tenant
        var employees = await _context.Users
            .Include(u => u.EmployeeProfile)
            .Where(u => u.TenantId == tenantId && u.Role == UserRole.Employee && u.IsActive)
            .ToListAsync();

        // 2. Fetch existing payrolls for the same month/year
        var existingRecords = await _context.PayrollRecords
            .Where(p => p.TenantId == tenantId && p.Year == year && p.Month == month)
            .ToListAsync();

        var newRecords = new List<PayrollRecord>();

        foreach (var employee in employees)
        {
            var existing = existingRecords.FirstOrDefault(r => r.UserId == employee.Id);
            if (existing != null)
            {
                // Optionally update existing record if needed, but usually we just skip or regenerate
                continue;
            }

            var baseSalary = employee.EmployeeProfile?.BasicSalary ?? 0;
            var dependents = employee.EmployeeProfile?.NumberOfDependents ?? 0;
            
            // Basic Vietnam Personal Income Tax logic
            // Note: In standard accounting, allowances and deductables like Social Insurance are calculated before PIT.
            // For simplicity in this demo, we assume BaseSalary is the gross income.
            
            // Taxable income = Gross - Personal deduction (11m) - Dependents deduction (4.4m)
            var tax = CalculatePersonalIncomeTax(baseSalary, dependents);
            
            // Allowances & Deductions can be populated from other tables, hardcoded for now
            var allowances = 0m;
            var deductions = tax; // We put tax inside deductions for simplicity

            var netPay = baseSalary + allowances - deductions;

            var record = new PayrollRecord
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                UserId = employee.Id,
                Year = year,
                Month = month,
                BaseSalary = baseSalary,
                Allowances = allowances,
                Deductions = deductions,
                NetPay = netPay,
                IsPaid = false,
                CreatedAt = DateTime.UtcNow
            };

            newRecords.Add(record);
        }

        if (newRecords.Any())
        {
            _context.PayrollRecords.AddRange(newRecords);
            
            var log = new AuditLog
            {
                TenantId = tenantId,
                UserId = tenantId, // Using tenantId for system action
                Action = "GENERATE_PAYROLL",
                EntityName = "PayrollRecord",
                Timestamp = DateTime.UtcNow,
                Details = $"Đã tự động tính lương tháng {month}/{year} cho {newRecords.Count} nhân viên."
            };
            _context.AuditLogs.Add(log);
            
            await _context.SaveChangesAsync();
        }

        // Return the updated page (first page)
        var result = await GetPayrollRecordsAsync(tenantId, year, month, 1, 1000); // 1000 to return all for export
        return result.Items;
    }

    private static decimal CalculatePersonalIncomeTax(decimal grossIncome, int numberOfDependents)
    {
        const decimal PersonalDeduction = 11_000_000m;
        const decimal DependentDeduction = 4_400_000m;

        var taxableIncome = grossIncome - PersonalDeduction - (numberOfDependents * DependentDeduction);
        
        if (taxableIncome <= 0) return 0;

        // Bậc thuế (Progressive tax brackets)
        // Bậc 1: Đến 5 triệu -> 5%
        // Bậc 2: 5 - 10 triệu -> 10%
        // Bậc 3: 10 - 18 triệu -> 15%
        // Bậc 4: 18 - 32 triệu -> 20%
        // Bậc 5: 32 - 52 triệu -> 25%
        // Bậc 6: 52 - 80 triệu -> 30%
        // Bậc 7: Trên 80 triệu -> 35%

        decimal tax = 0;
        decimal ti = taxableIncome;

        if (ti > 80_000_000m)
        {
            tax += (ti - 80_000_000m) * 0.35m;
            ti = 80_000_000m;
        }
        if (ti > 52_000_000m)
        {
            tax += (ti - 52_000_000m) * 0.30m;
            ti = 52_000_000m;
        }
        if (ti > 32_000_000m)
        {
            tax += (ti - 32_000_000m) * 0.25m;
            ti = 32_000_000m;
        }
        if (ti > 18_000_000m)
        {
            tax += (ti - 18_000_000m) * 0.20m;
            ti = 18_000_000m;
        }
        if (ti > 10_000_000m)
        {
            tax += (ti - 10_000_000m) * 0.15m;
            ti = 10_000_000m;
        }
        if (ti > 5_000_000m)
        {
            tax += (ti - 5_000_000m) * 0.10m;
            ti = 5_000_000m;
        }
        if (ti > 0)
        {
            tax += ti * 0.05m;
        }

        return tax;
    }
}
