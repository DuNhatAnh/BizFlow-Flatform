using System;
using System.Collections.Generic;
using BizFlow.Domain.Enums;

namespace BizFlow.Domain.Entities;

public class Order
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public Guid? CustomerId { get; set; }
    public Guid? CreatedBy { get; set; }
    public decimal TotalAmount { get; set; } = 0.00m;
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;
    public OrderStatus Status { get; set; } = OrderStatus.Draft;
    public OrderSource OrderSource { get; set; } = OrderSource.Manual;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Tenant? Tenant { get; set; }
    public Customer? Customer { get; set; }
    public User? Creator { get; set; }
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public ICollection<DebtTransaction> DebtTransactions { get; set; } = new List<DebtTransaction>();
}
