using System;
using System.ComponentModel.DataAnnotations;
using BizFlow.Domain.Enums;

namespace BizFlow.Application.DTOs.Taxes;

public class PayTaxRequestDto
{
    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal AmountToPay { get; set; }

    [Required]
    public PaymentMethod PaymentMethod { get; set; } // Cash or Transfer

    public string? Note { get; set; }
}
