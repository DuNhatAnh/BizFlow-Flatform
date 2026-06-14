using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BizFlow.Application.Common.Interfaces;
using BizFlow.Domain.Entities;
using BizFlow.Domain.Enums;

namespace BizFlow.WebApi.Controllers;

public class CustomersController : ApiControllerBase
{
    private readonly IApplicationDbContext _context;

    public CustomersController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Customer>>> GetCustomers([FromQuery] Guid tenantId, [FromQuery] string? search)
    {
        var query = _context.Customers.Where(c => c.TenantId == tenantId);

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(c => c.Fullname.Contains(search) || (c.Phone != null && c.Phone.Contains(search)));
        }

        return await query.OrderByDescending(c => c.CreatedAt).ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Customer>> CreateCustomer([FromBody] CreateCustomerRequest request)
    {
        if (string.IsNullOrEmpty(request.Fullname))
        {
            return BadRequest(new { Message = "Tên khách hàng là bắt buộc" });
        }

        var customer = new Customer
        {
            Id = Guid.NewGuid(),
            TenantId = request.TenantId,
            Fullname = request.Fullname,
            Phone = request.Phone,
            TotalDebt = 0.00m,
            CreatedAt = DateTime.UtcNow
        };

        _context.Customers.Add(customer);
        await _context.SaveChangesAsync(CancellationToken.None);

        return Ok(customer);
    }

    [HttpPost("debt-pay")]
    public async Task<IActionResult> CollectDebt([FromBody] CollectDebtRequest request)
    {
        if (request.Amount <= 0)
        {
            return BadRequest(new { Message = "Số tiền thu nợ phải lớn hơn 0" });
        }

        using var transaction = await _context.BeginTransactionAsync(CancellationToken.None);
        try
        {
            var customer = await _context.Customers
                .FirstOrDefaultAsync(c => c.Id == request.CustomerId && c.TenantId == request.TenantId);

            if (customer == null)
            {
                return NotFound(new { Message = "Không tìm thấy khách hàng" });
            }

            // 1. Create debt transaction (Decrease)
            var debtTx = new DebtTransaction
            {
                Id = Guid.NewGuid(),
                TenantId = request.TenantId,
                CustomerId = request.CustomerId,
                OrderId = null,
                Type = DebtTransactionType.Decrease,
                Amount = request.Amount,
                CreatedAt = DateTime.UtcNow
            };
            _context.DebtTransactions.Add(debtTx);

            // 2. Decrement customer's total debt
            customer.TotalDebt -= request.Amount;

            // 3. Create accounting journal entry
            var accountingEntry = new AccountingEntry
            {
                Id = Guid.NewGuid(),
                TenantId = request.TenantId,
                TransactionDate = DateTime.UtcNow,
                DocumentType = DocumentType.Sales,
                DocumentRefId = debtTx.Id.ToString(),
                AccountCategory = AccountCategory.Revenue_Services,
                Amount = request.Amount,
                Description = $"Thu nợ từ khách hàng {customer.Fullname}, Số tiền: {request.Amount:N0} VND"
            };
            _context.AccountingEntries.Add(accountingEntry);

            await _context.SaveChangesAsync(CancellationToken.None);
            await transaction.CommitAsync(CancellationToken.None);

            return Ok(new { Message = "Thu nợ thành công", NewTotalDebt = customer.TotalDebt });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(CancellationToken.None);
            return StatusCode(500, new { Message = "Có lỗi xảy ra trong quá trình thu nợ", Detail = ex.Message });
        }
    }
}

public class CreateCustomerRequest
{
    public Guid TenantId { get; set; }
    public string Fullname { get; set; } = string.Empty;
    public string? Phone { get; set; }
}

public class CollectDebtRequest
{
    public Guid TenantId { get; set; }
    public Guid CustomerId { get; set; }
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = "Cash"; // Cash or Transfer
}
