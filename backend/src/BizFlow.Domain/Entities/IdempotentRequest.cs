using System;

namespace BizFlow.Domain.Entities;

public class IdempotentRequest
{
    public Guid Id { get; set; }
    public string IdempotencyKey { get; set; } = null!;
    public string Name { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}
