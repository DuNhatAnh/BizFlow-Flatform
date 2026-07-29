using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using BizFlow.Application.Common.Interfaces;
using BizFlow.Domain.Entities;

namespace BizFlow.Infrastructure.Services;

public class NumberSequenceService : INumberSequenceService
{
    private readonly IApplicationDbContext _context;

    public NumberSequenceService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<string> GetNextSequenceAsync(Guid tenantId, string prefix)
    {
        int retries = 5;
        
        while (retries > 0)
        {
            try
            {
                var sequence = await _context.NumberSequences
                    .FirstOrDefaultAsync(s => s.TenantId == tenantId && s.Prefix == prefix);

                if (sequence == null)
                {
                    sequence = new NumberSequence
                    {
                        Id = Guid.NewGuid(),
                        TenantId = tenantId,
                        Prefix = prefix,
                        LastNumber = 1
                    };
                    _context.NumberSequences.Add(sequence);
                }
                else
                {
                    sequence.LastNumber++;
                    _context.NumberSequences.Update(sequence);
                }

                await _context.SaveChangesAsync(CancellationToken.None);
                return $"{prefix}-{DateTime.UtcNow:yyMMdd}-{sequence.LastNumber:D3}";
            }
            catch (DbUpdateConcurrencyException)
            {
                retries--;
                if (retries == 0) throw;
                // Wait briefly before retrying
                await Task.Delay(50);
            }
        }
        
        throw new Exception("Unable to generate number sequence due to concurrency conflicts.");
    }
}
