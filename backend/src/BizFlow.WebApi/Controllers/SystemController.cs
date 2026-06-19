using Microsoft.AspNetCore.Mvc;
using BizFlow.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Linq;

namespace BizFlow.WebApi.Controllers;

[ApiController]
[Route("api/system")]
public class SystemController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SystemController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("categories-check")]
    public async Task<IActionResult> CheckCategories()
    {
        var tenantId = System.Guid.Parse("11111111-1111-1111-1111-111111111111");
        var cats = await _context.Categories.Where(c => c.TenantId == tenantId).ToListAsync();
        return Ok(cats);
    }
}
