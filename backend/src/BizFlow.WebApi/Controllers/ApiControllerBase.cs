using Microsoft.AspNetCore.Mvc;

namespace BizFlow.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class ApiControllerBase : ControllerBase
{
}
