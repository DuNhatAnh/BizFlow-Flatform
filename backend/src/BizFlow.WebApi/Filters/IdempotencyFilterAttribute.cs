using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using BizFlow.Application.Common.Interfaces;
using BizFlow.Domain.Entities;

namespace BizFlow.WebApi.Filters;

public class IdempotentAttribute : TypeFilterAttribute
{
    public IdempotentAttribute() : base(typeof(IdempotencyFilter))
    {
    }
}

public class IdempotencyFilter : IAsyncActionFilter
{
    private readonly IApplicationDbContext _context;

    public IdempotencyFilter(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var request = context.HttpContext.Request;

        if (request.Headers.TryGetValue("X-Idempotency-Key", out var keyValues))
        {
            var idempotencyKey = keyValues.ToString();
            
            // Using AnyAsync or FindAsync? The PK is Id (Guid), but IdempotencyKey is indexed and unique
            var existingRequest = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.FirstOrDefaultAsync(
                _context.IdempotentRequests, 
                x => x.IdempotencyKey == idempotencyKey);
                
            if (existingRequest != null)
            {
                context.Result = new ConflictObjectResult(new { Message = "Duplicate request. A request with this idempotency key has already been processed." });
                return;
            }

            var idempRequest = new IdempotentRequest
            {
                Id = Guid.NewGuid(),
                IdempotencyKey = idempotencyKey,
                Name = context.ActionDescriptor.DisplayName ?? "Unknown",
                CreatedAt = DateTime.UtcNow
            };

            _context.IdempotentRequests.Add(idempRequest);
            await _context.SaveChangesAsync();
        }

        await next();
    }
}
