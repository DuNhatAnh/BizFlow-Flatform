using Microsoft.AspNetCore.Mvc;
using BizFlow.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Linq;

namespace BizFlow.WebApi.Controllers;

[ApiController]
[Route("api/system")]
public class SystemController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SystemController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("categories-check")]
    public async Task<IActionResult> CheckCategories()
    {
        var tenantId = System.Guid.Parse("11111111-1111-1111-1111-111111111111");
        var cats = await _context.Categories.Where(c => c.TenantId == tenantId).ToListAsync();
        return Ok(cats);
    }

    [HttpPost("backfill-cash")]
    public async Task<IActionResult> BackfillCash()
    {
        int added = 0;
        
        // 1. Backfill Inventory Receipts
        var receipts = await _context.InventoryReceipts.ToListAsync();
        var existingCashTxs = await _context.CashTransactions.Select(c => c.ReferenceDocument).ToListAsync();
        
        foreach (var receipt in receipts)
        {
            var refDoc = receipt.ReferenceDocumentNo ?? receipt.ReceiptCode ?? "Không số";
            if (!existingCashTxs.Contains(refDoc) && receipt.TotalAmount > 0)
            {
                var prefix = receipt.Type == BizFlow.Domain.Enums.ReceiptType.Import ? "PC" : "PT";
                var cashTxType = receipt.Type == BizFlow.Domain.Enums.ReceiptType.Import ? BizFlow.Domain.Enums.CashTransactionType.Payment : BizFlow.Domain.Enums.CashTransactionType.Receipt;
                
                var dateStr = receipt.Date.ToString("yyMMdd");
                var txCode = $"{prefix}-{dateStr}-BF{added}";
                
                var cashTx = new BizFlow.Domain.Entities.CashTransaction
                {
                    Id = System.Guid.NewGuid(),
                    TenantId = receipt.TenantId,
                    Type = cashTxType,
                    PaymentMethod = BizFlow.Domain.Enums.PaymentMethod.Cash,
                    Amount = receipt.TotalAmount,
                    TransactionDate = receipt.Date,
                    TransactionCode = txCode,
                    Reason = receipt.Type == BizFlow.Domain.Enums.ReceiptType.Import 
                        ? $"Chi tiền nhập kho (Backfill) - Chứng từ {refDoc}" 
                        : $"Thu tiền xuất kho (Backfill) - Chứng từ {refDoc}",
                    ReferenceDocument = refDoc,
                    RelatedUserId = receipt.CreatedBy,
                    PayerReceiverName = receipt.DelivererReceiverName ?? "Người giao/nhận",
                    CreatedAt = receipt.Date
                };
                _context.CashTransactions.Add(cashTx);
                existingCashTxs.Add(refDoc);
                added++;
            }
        }
        
        // 2. Backfill Orders (Cash/Transfer)
        var orders = await _context.Orders.Where(o => o.PaymentMethod == BizFlow.Domain.Enums.PaymentMethod.Cash || o.PaymentMethod == BizFlow.Domain.Enums.PaymentMethod.Transfer).ToListAsync();
        foreach (var order in orders)
        {
            var refDoc = order.Code;
            if (!existingCashTxs.Contains(refDoc) && order.TotalAmount > 0)
            {
                var dateStr = order.CreatedAt.ToString("yyMMdd");
                var txCode = $"PT-{dateStr}-BF{added}";
                var cashTx = new BizFlow.Domain.Entities.CashTransaction
                {
                    Id = System.Guid.NewGuid(),
                    TenantId = order.TenantId,
                    Type = BizFlow.Domain.Enums.CashTransactionType.Receipt,
                    PaymentMethod = order.PaymentMethod,
                    Amount = order.TotalAmount,
                    TransactionDate = order.CreatedAt,
                    TransactionCode = txCode,
                    Reason = $"Thu tiền bán hàng (Backfill) - Đơn hàng #{order.Code}",
                    ReferenceDocument = order.Code,
                    RelatedUserId = order.CreatedBy,
                    PayerReceiverName = order.CustomerId.HasValue ? "Khách hàng" : "Khách vãng lai",
                    CreatedAt = order.CreatedAt
                };
                _context.CashTransactions.Add(cashTx);
                existingCashTxs.Add(refDoc);
                added++;
            }
        }
        
        await _context.SaveChangesAsync();
        return Ok(new { Message = "Backfill completed", Added = added });
    }
}
