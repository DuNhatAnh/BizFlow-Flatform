using System;

namespace BizFlow.Domain.Entities;

public class AiRequestLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? TenantId { get; set; }
    public Guid? UserId { get; set; }
    public string RequestType { get; set; } = string.Empty; // VoiceOrder, TextOrder, Chatbot
    public string ModelName { get; set; } = string.Empty;
    public int PromptTokens { get; set; }
    public int CompletionTokens { get; set; }
    public int TotalTokens { get; set; }
    public decimal Cost { get; set; }
    public int DurationMs { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    // Navigation properties (optional)
    public Tenant? Tenant { get; set; }
    public User? User { get; set; }
}
