using System;
using BizFlow.Domain.Enums;

namespace BizFlow.Application.DTOs.Cash;

public class CashTransactionDto
{
    public Guid Id { get; set; }
    public CashTransactionType Type { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public decimal Amount { get; set; }
    public DateTime TransactionDate { get; set; }
    public string TransactionCode { get; set; } = string.Empty;
    public string? Reason { get; set; }
    public string? ReferenceDocument { get; set; }
    public Guid? RelatedUserId { get; set; }
    public string? PayerReceiverName { get; set; }
    public string? Address { get; set; }
    public string? AttachedDocuments { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? CreatorName { get; set; }
}

public class CreateCashTransactionRequest
{
    public CashTransactionType Type { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public decimal Amount { get; set; }
    public string? Reason { get; set; }
    public string? ReferenceDocument { get; set; }
    public Guid? RelatedUserId { get; set; }
    public string? PayerReceiverName { get; set; }
    public string? Address { get; set; }
    public string? AttachedDocuments { get; set; }
}
