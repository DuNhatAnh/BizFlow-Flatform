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

        var expenseQuery = _context.ExpenseRecords
            .Where(e => e.ExpenseDate >= startDate && e.ExpenseDate <= endDate);

        var cogsQuery = _context.AccountingLedgerS2s
            .Where(e => e.Type == Domain.Enums.ReceiptType.Export && e.Date >= startDate && e.Date <= endDate);

        // Fetch into memory since we'll merge them
        var expenses = await expenseQuery.ToListAsync();
        var cogs = await cogsQuery.ToListAsync();

        var result = new List<S3LedgerRowDto>();

        foreach (var expense in expenses)
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
                    var desc = expense.Description?.ToLower() ?? "";
                    if (desc.Contains("nước"))
                    {
                        row.Col3_Water += expense.Amount;
                    }
                    else if (desc.Contains("viễn thông") || desc.Contains("internet") || desc.Contains("mạng") || desc.Contains("điện thoại") || desc.Contains("wifi"))
                    {
                        row.Col4_Telecom += expense.Amount;
                    }
                    else
                    {
                        row.Col2_Electricity += expense.Amount; // Default to electricity if "điện" or ambiguous
                    }
                    break;
                case Domain.Enums.ExpenseCategory.RentCost:
                    row.Col5_Rent += expense.Amount;
                    break;
                case Domain.Enums.ExpenseCategory.ManagementCost:
                    row.Col6_Management += expense.Amount;
                    break;
                case Domain.Enums.ExpenseCategory.MaterialCost:
                case Domain.Enums.ExpenseCategory.OtherCost:
                default:
                    row.Col7_Other += expense.Amount;
                    break;
            }
            result.Add(row);
        }

        foreach (var cog in cogs)
        {
            var amount = cog.ValueOut;
            var row = new S3LedgerRowDto
            {
                Date = cog.Date,
                ReceiptNo = cog.Receipt?.ReceiptCode ?? $"XK-{cog.Id.ToString().Substring(0, 8)}",
                ReceiptDate = cog.Date,
                Description = $"Giá vốn hàng xuất bán - {cog.Product?.Name}",
                Notes = string.Empty
            };
            row.Col7_Other += amount;
            result.Add(row);
        }

        // Paging and sorting
        var sortedAndPaged = result
            .OrderBy(r => r.Date)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        var dto = new S3LedgerReportDto
        {
            TotalCol1_Labor = result.Sum(r => r.Col1_Labor),
            TotalCol2_Electricity = result.Sum(r => r.Col2_Electricity),
            TotalCol3_Water = result.Sum(r => r.Col3_Water),
            TotalCol4_Telecom = result.Sum(r => r.Col4_Telecom),
            TotalCol5_Rent = result.Sum(r => r.Col5_Rent),
            TotalCol6_Management = result.Sum(r => r.Col6_Management),
            TotalCol7_Other = result.Sum(r => r.Col7_Other),
            Records = new BizFlow.Application.DTOs.Common.PagedResult<S3LedgerRowDto>
            {
                Items = sortedAndPaged,
                TotalCount = result.Count,
                PageNumber = pageNumber,
                PageSize = pageSize
            }
        };

        return dto;
    }

    public async Task<bool> RebuildS2LedgerValidationAsync(Guid tenantId)
    {
        var products = await _context.Products.Where(p => p.TenantId == tenantId).ToListAsync();
        
        var receipts = await _context.InventoryReceiptDetails
            .Include(d => d.Receipt)
            .Include(d => d.Product)
            .Where(d => d.Receipt.TenantId == tenantId && d.Receipt.Type == Domain.Enums.ReceiptType.Import)
            .ToListAsync();
            
        var orderItems = await _context.OrderItems
            .Include(oi => oi.Order)
            .Include(oi => oi.ProductUnit)
            .Where(oi => oi.Order.TenantId == tenantId && (oi.Order.Status == Domain.Enums.OrderStatus.Completed || oi.Order.Status == Domain.Enums.OrderStatus.Refunded))
            .ToListAsync();
            
        var adjustments = await _context.InventoryTransactions
            .Where(t => t.TenantId == tenantId && t.Type == Domain.Enums.InventoryTransactionType.Adjustment)
            .ToListAsync();

        bool isValid = true;
        
        foreach (var product in products)
        {
            decimal calculatedQty = 0;
            
            var productImports = receipts.Where(r => r.ProductId == product.Id).Sum(r => r.Quantity);
            calculatedQty += productImports;
            
            var productSales = orderItems.Where(oi => oi.ProductId == product.Id);
            foreach (var sale in productSales)
            {
                var conversion = sale.ProductUnit?.ConversionRate ?? 1;
                calculatedQty -= (sale.Quantity * conversion); // Quantity is negative for Return orders, so this adds it back
            }
            
            var productAdjustments = adjustments.Where(a => a.ProductId == product.Id).Sum(a => a.Quantity);
            calculatedQty += productAdjustments;
            
            if (Math.Round(calculatedQty, 4) != Math.Round(product.StockQuantity, 4))
            {
                isValid = false;
                Console.WriteLine($"Mismatch for Product {product.Id}: Calculated {calculatedQty}, Actual {product.StockQuantity}");
            }
        }
        
        return isValid;
    }
    
    public async Task<CashLedgerReportDto> GetCashLedgerAsync(DateTime startDate, DateTime endDate, BizFlow.Domain.Enums.PaymentMethod paymentMethod, Guid? bankAccountId = null, int pageNumber = 1, int pageSize = 20)
    {
        // Adjust end date to cover the entire day if time is exactly midnight
        if (endDate.TimeOfDay == TimeSpan.Zero)
        {
            endDate = endDate.AddDays(1).AddTicks(-1);
        }

        var query = _context.CashTransactions.Where(t => t.PaymentMethod == paymentMethod);
        if (paymentMethod == BizFlow.Domain.Enums.PaymentMethod.Transfer && bankAccountId.HasValue)
        {
            query = query.Where(t => t.BankAccountId == bankAccountId);
        }

        // Calculate opening balance
        var pastTransactions = await query
            .Where(t => t.TransactionDate < startDate)
            .Select(t => new { t.Type, t.Amount })
            .ToListAsync();
            
        decimal openingBalance = 0;
        foreach (var t in pastTransactions)
        {
            if (t.Type == Domain.Enums.CashTransactionType.Receipt) openingBalance += t.Amount;
            else if (t.Type == Domain.Enums.CashTransactionType.Payment) openingBalance -= t.Amount;
        }

        // Get transactions for the period
        var transactions = await query
            .Where(t => t.TransactionDate >= startDate && t.TransactionDate <= endDate)
            .OrderBy(t => t.TransactionDate)
            .ThenBy(t => t.CreatedAt)
            .ToListAsync();

        var result = new CashLedgerReportDto
        {
            OpeningBalance = openingBalance
        };

        decimal currentBalance = openingBalance;
        decimal totalReceipt = 0;
        decimal totalPayment = 0;

        var allRows = new List<CashLedgerRowDto>();

        foreach (var t in transactions)
        {
            var row = new CashLedgerRowDto
            {
                Id = t.Id,
                TransactionDate = t.CreatedAt,
                DocumentDate = t.TransactionDate,
                DocumentCode = t.TransactionCode,
                Description = t.Reason ?? string.Empty
            };

            if (t.Type == Domain.Enums.CashTransactionType.Receipt)
            {
                row.ReceiptAmount = t.Amount;
                currentBalance += t.Amount;
                totalReceipt += t.Amount;
            }
            else if (t.Type == Domain.Enums.CashTransactionType.Payment)
            {
                row.PaymentAmount = t.Amount;
                currentBalance -= t.Amount;
                totalPayment += t.Amount;
            }

            row.RunningBalance = currentBalance;
            allRows.Add(row);
        }

        result.TotalReceipt = totalReceipt;
        result.TotalPayment = totalPayment;
        result.ClosingBalance = currentBalance;
        
        var totalCount = allRows.Count;
        var pagedItems = allRows
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        result.Transactions = new BizFlow.Application.DTOs.Common.PagedResult<CashLedgerRowDto>
        {
            Items = pagedItems,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };

        // Fetch bank info if it's S7 and bank account is selected
        if (paymentMethod == BizFlow.Domain.Enums.PaymentMethod.Transfer && bankAccountId.HasValue)
        {
            var bankAccount = await _context.BankAccounts.FindAsync(bankAccountId);
            if (bankAccount != null)
            {
                result.BankName = bankAccount.BankName;
                result.BranchName = bankAccount.BranchName;
                result.AccountNumber = bankAccount.AccountNumber;
            }
        }

        return result;
    }
}
