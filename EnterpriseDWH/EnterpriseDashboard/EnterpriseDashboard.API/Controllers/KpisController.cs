using Microsoft.AspNetCore.Mvc;
using EnterpriseDashboard.API.Services;
using EnterpriseDashboard.API.Models;
using System.Threading.Tasks;

namespace EnterpriseDashboard.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class KpisController : ControllerBase
{
    private readonly IMdxQueryService _queryService;

    public KpisController(IMdxQueryService queryService)
    {
        _queryService = queryService;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<KpiSummaryDto>> GetSummary()
    {
        var summary = await _queryService.GetKpiSummaryAsync();
        return Ok(summary);
    }
}
