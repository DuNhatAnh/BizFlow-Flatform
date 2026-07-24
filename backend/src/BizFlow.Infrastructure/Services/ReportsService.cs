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

    public async Task<List<S1LedgerRowDto>> GetS1LedgerAsync(DateTime startDate, DateTime endDate)
    {
        // Adjust end date to cover the entire day if time is exactly midnight
        if (endDate.TimeOfDay == TimeSpan.Zero)
        {
            endDate = endDate.AddDays(1).AddTicks(-1);
        }

        var orders = await _context.Orders
            .Include(o => o.OrderItems)
            .Where(o => o.Status == Domain.Enums.OrderStatus.Completed && o.CreatedAt >= startDate && o.CreatedAt <= endDate)
            .OrderBy(o => o.CreatedAt)
            .ToListAsync();

        var result = new List<S1LedgerRowDto>();

        foreach (var order in orders)
        {
            var row = new S1LedgerRowDto
            {
                Date = order.CreatedAt,
                ReceiptNo = order.OrderCode ?? order.Id.ToString().Substring(0, 8),
                ReceiptDate = order.CreatedAt,
                Description = string.IsNullOrWhiteSpace(order.CustomerName) 
                    ? "Khách lẻ" 
                    : $"Khách hàng: {order.CustomerName}",
                Notes = order.Notes ?? string.Empty
            };

            foreach (var item in order.OrderItems)
            {
                var revenue = item.TotalPrice;
                var taxType = item.VatRate ?? "1.5"; // User maps their tax rate in VatRate field

                if (taxType == "1.5")
                    row.Col1_Distribution += revenue;
                else if (taxType == "7")
                    row.Col2_Services += revenue;
                else if (taxType == "4.5")
                    row.Col3_Production += revenue;
                else if (taxType == "3")
                    row.Col4_Other += revenue;
                else
                    row.Col1_Distribution += revenue; // Fallback to col1
            }

            result.Add(row);
        }

        return result;
    }
}
