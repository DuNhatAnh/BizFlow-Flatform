using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using BizFlow.Domain.Enums;

namespace BizFlow.Application.DTOs.Orders;

public class ConfirmDraftOrderRequest
{
    public Guid? CustomerId { get; set; }
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;
    public string? CustomerName { get; set; }
    
    [Required]
    public List<CreateOrderItemRequest> OrderItems { get; set; } = new();
}
