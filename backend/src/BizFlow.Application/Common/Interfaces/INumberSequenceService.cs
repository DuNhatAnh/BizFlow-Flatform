using System;
using System.Threading.Tasks;

namespace BizFlow.Application.Common.Interfaces;

public interface INumberSequenceService
{
    Task<string> GetNextSequenceAsync(Guid tenantId, string prefix);
}
