using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BizFlow.Application.DTOs.Reports;
using BizFlow.Application.Interfaces;
using BizFlow.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace BizFlow.Infrastructure.Services;

public class ReportsService : IReportsService
{
    private readonly ApplicationDbContext _context;

    public ReportsService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<S1LedgerReportDto> GetS1LedgerAsync(DateTime startDate, DateTime endDate, int pageNumber = 1, int pageSize = 20)
    {
        // Adjust end date to cover the entire day if time is exactly midnight
        if (endDate.TimeOfDay == TimeSpan.Zero)
        {
            endDate = endDate.AddDays(1).AddTicks(-1);
        }

        var query = _context.Orders
            .Include(o => o.OrderItems)
            .Where(o => o.Status == Domain.Enums.OrderStatus.Completed && o.CreatedAt >= startDate && o.CreatedAt <= endDate);

        var totalCount = await query.CountAsync();

        var allItems = await _context.OrderItems
            .Where(i => i.Order.Status == Domain.Enums.OrderStatus.Completed && i.Order.CreatedAt >= startDate && i.Order.CreatedAt <= endDate)
            .Select(i => new { i.TotalPrice, i.VatRate })
            .ToListAsync();

        decimal totalCol1 = 0, totalCol2 = 0, totalCol3 = 0, totalCol4 = 0;
        foreach (var item in allItems)
        {
            var taxType = item.VatRate ?? "1.5";
            if (decimal.TryParse(taxType, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var rate))
            {
                if (rate == 1.5m) totalCol1 += item.TotalPrice;
                else if (rate == 7m) totalCol2 += item.TotalPrice;
                else if (rate == 4.5m) totalCol3 += item.TotalPrice;
                else if (rate == 3m) totalCol4 += item.TotalPrice;
                else totalCol1 += item.TotalPrice; // Fallback
            }
            else
            {
                totalCol1 += item.TotalPrice; // Fallback for invalid strings
            }
        }

        var pagedOrders = await query
            .OrderBy(o => o.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var result = new List<S1LedgerRowDto>();

        foreach (var order in pagedOrders)
        {
            var row = new S1LedgerRowDto
            {
                Date = order.CreatedAt,
                ReceiptNo = order.Code ?? order.Id.ToString().Substring(0, 8),
                ReceiptDate = order.CreatedAt,
                Description = string.IsNullOrWhiteSpace(order.CustomerName) 
                    ? "Khách lẻ" 
                    : $"Khách hàng: {order.CustomerName}",
                Notes = string.Empty
            };

            foreach (var item in order.OrderItems)
            {
                var revenue = item.TotalPrice;
                var taxType = item.VatRate ?? "1.5"; 

                if (decimal.TryParse(taxType, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var rate))
                {
                    if (rate == 1.5m) row.Col1_Distribution += revenue;
                    else if (rate == 7m) row.Col2_Services += revenue;
                    else if (rate == 4.5m) row.Col3_Production += revenue;
                    else if (rate == 3m) row.Col4_Other += revenue;
                    else row.Col1_Distribution += revenue;
                }
                else
                {
                    row.Col1_Distribution += revenue;
                }
            }
            result.Add(row);
        }

        return new S1LedgerReportDto
        {
            TotalCol1_Distribution = totalCol1,
            TotalCol2_Services = totalCol2,
            TotalCol3_Production = totalCol3,
            TotalCol4_Other = totalCol4,
            Records = new BizFlow.Application.DTOs.Common.PagedResult<S1LedgerRowDto>
            {
                Items = result,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            }
        };
    }

    public async Task<S3LedgerReportDto> GetS3LedgerAsync(DateTime startDate, DateTime endDate, int pageNumber = 1, int pageSize = 20)
    {
        // Adjust end date to cover the entire day if time is exactly midnight
        if (endDate.TimeOfDay == TimeSpan.Zero)
        {
            endDate = endDate.AddDays(1).AddTicks(-1);
        }

        var query = _context.ExpenseRecords
            .Where(e => e.ExpenseDate >= startDate && e.ExpenseDate <= endDate);

        var totalCount = await query.CountAsync();

        var aggregates = await query
            .GroupBy(e => 1)
            .Select(g => new {
                TotalLabor = g.Where(e => e.Category == Domain.Enums.ExpenseCategory.LaborCost).Sum(e => e.Amount),
                TotalUtilities = g.Where(e => e.Category == Domain.Enums.ExpenseCategory.UtilityCost).Sum(e => e.Amount),
                TotalRent = g.Where(e => e.Category == Domain.Enums.ExpenseCategory.RentCost).Sum(e => e.Amount),
                TotalManagement = g.Where(e => e.Category == Domain.Enums.ExpenseCategory.ManagementCost).Sum(e => e.Amount),
                TotalOther = g.Where(e => e.Category == Domain.Enums.ExpenseCategory.MaterialCost || e.Category == Domain.Enums.ExpenseCategory.OtherCost).Sum(e => e.Amount)
            })
            .FirstOrDefaultAsync();

        var pagedExpenses = await query
            .OrderBy(e => e.ExpenseDate)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var result = new List<S3LedgerRowDto>();

        foreach (var expense in pagedExpenses)
        {
            var row = new S3LedgerRowDto
            {
                Date = expense.ExpenseDate,
                ReceiptNo = expense.ReferenceDocument ?? $"PT-{expense.Id.ToString().Substring(0, 8)}",
                ReceiptDate = expense.ExpenseDate,
                Description = expense.Description ?? "Chi phí",
                Notes = string.Empty
            };

            switch (expense.Category)
            {
                case Domain.Enums.ExpenseCategory.LaborCost:
                    row.Col1_Labor += expense.Amount;
                    break;
                case Domain.Enums.ExpenseCategory.UtilityCost:
                    row.Col2_Utilities += expense.Amount;
                    break;
                case Domain.Enums.ExpenseCategory.RentCost:
                    row.Col3_Rent += expense.Amount;
                    break;
                case Domain.Enums.ExpenseCategory.ManagementCost:
                    row.Col4_Management += expense.Amount;
                    break;
                case Domain.Enums.ExpenseCategory.MaterialCost:
                case Domain.Enums.ExpenseCategory.OtherCost:
                default:
                    row.Col5_Other += expense.Amount;
                    break;
            }

            result.Add(row);
        }

        return new S3LedgerReportDto
        {
            TotalCol1_Labor = aggregates?.TotalLabor ?? 0,
            TotalCol2_Utilities = aggregates?.TotalUtilities ?? 0,
            TotalCol3_Rent = aggregates?.TotalRent ?? 0,
            TotalCol4_Management = aggregates?.TotalManagement ?? 0,
            TotalCol5_Other = aggregates?.TotalOther ?? 0,
            Records = new BizFlow.Application.DTOs.Common.PagedResult<S3LedgerRowDto>
            {
                Items = result,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            }
        };
    }
}
