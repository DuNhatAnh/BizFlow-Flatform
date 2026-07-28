using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using BizFlow.Application.DTOs.Taxes;
using BizFlow.Application.DTOs.Tax;

namespace BizFlow.Application.Interfaces;

public interface ITaxService
{
    Task<IEnumerable<TaxObligationDto>> GetS4LedgerAsync(Guid tenantId, int? year, int? month, CancellationToken cancellationToken);
    Task<TaxObligationDto> CreateTaxObligationAsync(Guid tenantId, CreateTaxObligationDto request, CancellationToken cancellationToken);
    Task<TaxObligationDto> PayTaxAsync(Guid tenantId, Guid taxId, Guid userId, PayTaxRequestDto request, CancellationToken cancellationToken);
    Task CalculateMonthlyTaxAsync(Guid tenantId, Guid userId, CalculateTaxRequest request, CancellationToken cancellationToken);
}
