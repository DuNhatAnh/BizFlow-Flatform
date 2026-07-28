using System;

namespace BizFlow.Application.DTOs.Tax;

public class CalculateTaxRequest
{
    public int Year { get; set; }
    public int Month { get; set; }
}
