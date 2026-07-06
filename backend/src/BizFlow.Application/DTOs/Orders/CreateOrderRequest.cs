using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using BizFlow.Domain.Enums;

namespace BizFlow.Application.DTOs.Orders;

public class CreateOrderRequest
{
    public Guid? CustomerId { get; set; }
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;
    public string? CustomerName { get; set; }
    
    [Required]
    [MinLength(1, ErrorMessage = "Đơn hàng phải có ít nhất một sản phẩm.")]
    public List<CreateOrderItemRequest> OrderItems { get; set; } = new();
}

public class CreateOrderItemRequest
{
    [Required]
    public Guid ProductId { get; set; }
    public int? ProductUnitId { get; set; }
    
    [Range(0.01, double.MaxValue, ErrorMessage = "Số lượng phải lớn hơn 0.")]
    public decimal Quantity { get; set; } = 1m;
    
    [Range(0, double.MaxValue, ErrorMessage = "Đơn giá phải lớn hơn hoặc bằng 0.")]
    public decimal UnitPrice { get; set; } = 0.00m;
}
