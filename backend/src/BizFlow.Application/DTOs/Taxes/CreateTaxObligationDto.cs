using System;
using System.ComponentModel.DataAnnotations;
using BizFlow.Domain.Enums;

namespace BizFlow.Application.DTOs.Taxes;

public class CreateTaxObligationDto
{
    [Required]
    public TaxType TaxType { get; set; }

    [Required]
    [Range(2000, 2100)]
    public int Year { get; set; }

    [Required]
    [Range(0, 12)]
    public int Month { get; set; } // 0 for annual tax

    [Required]
    [Range(0, double.MaxValue)]
    public decimal AmountDue { get; set; }

    public DateTime? DueDate { get; set; }

    public string? Note { get; set; }
}
