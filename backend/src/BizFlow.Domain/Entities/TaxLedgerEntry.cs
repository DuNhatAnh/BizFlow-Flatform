using System;
using BizFlow.Domain.Enums;

namespace BizFlow.Domain.Entities;

public class TaxLedgerEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    
    // Loại thuế (VAT, TNCN...)
    public TaxType TaxType { get; set; }
    
    // Loại giao dịch thuế (Phát sinh nợ, Thanh toán nợ, Điều chỉnh)
    public TaxEntryType EntryType { get; set; }
    
    // Kỳ kế toán
    public int Year { get; set; }
    public int Month { get; set; } // 0 if annual
    
    // Số tiền (Luôn dương, tính chất +/- phụ thuộc vào EntryType khi tính tổng)
    public decimal Amount { get; set; }
    
    // Liên kết với giao dịch chi tiền mặt/ngân hàng nếu đây là thanh toán
    public Guid? ReferenceTransactionId { get; set; }
    
    // Liên kết tới TaxLedgerEntry gốc (loại Incurred) nếu đây là Payment
    public Guid? LinkedEntryId { get; set; }
    
    public DateTime? DueDate { get; set; }
    public string? Note { get; set; }
    
    public Guid? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Tenant Tenant { get; set; } = null!;
}
