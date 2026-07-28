using System;
using BizFlow.Domain.Enums;

namespace BizFlow.Application.DTOs.Taxes;

public class TaxObligationDto
{
    public Guid Id { get; set; }
    public TaxType TaxType { get; set; }
    public string TaxTypeName => TaxType.ToString(); // Helper for frontend
    public int Year { get; set; }
    public int Month { get; set; }
    public decimal AmountDue { get; set; }
    public decimal AmountPaid { get; set; }
    public decimal RemainingAmount => AmountDue - AmountPaid;
    public DateTime? DueDate { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; }
}
