using System;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

namespace BizFlow.WebApi.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal principal)
    {
        var claimVal = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                       ?? principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        return Guid.TryParse(claimVal, out var userId) ? userId : Guid.Empty;
    }
}
