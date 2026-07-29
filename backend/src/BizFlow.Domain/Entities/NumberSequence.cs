using System;
using System.ComponentModel.DataAnnotations;

namespace BizFlow.Domain.Entities;

public class NumberSequence
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Prefix { get; set; } = null!;
    public int LastNumber { get; set; }
    
    [Timestamp]
    public byte[]? RowVersion { get; set; }
}
