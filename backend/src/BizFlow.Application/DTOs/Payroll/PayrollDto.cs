using System;

namespace BizFlow.Application.DTOs.Payroll;

public class PayrollDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Fullname { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public int Year { get; set; }
    public int Month { get; set; }
    public decimal BaseSalary { get; set; }
    public decimal Allowances { get; set; }
    public decimal Deductions { get; set; }
    public decimal PersonalTax { get; set; } // Added to show on UI
    public decimal NetPay { get; set; }
    public bool IsPaid { get; set; }
    public DateTime? PaymentDate { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? BankAccountNumber { get; set; }
    public string? BankName { get; set; }
    public int NumberOfDependents { get; set; }
}
