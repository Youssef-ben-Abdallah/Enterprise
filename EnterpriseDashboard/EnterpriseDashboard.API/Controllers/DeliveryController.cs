using Microsoft.AspNetCore.Mvc;
using EnterpriseDashboard.API.Services;
using EnterpriseDashboard.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EnterpriseDashboard.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DeliveryController : ControllerBase
{
    private readonly IMdxQueryService _queryService;

    public DeliveryController(IMdxQueryService queryService)
    {
        _queryService = queryService;
    }

    [HttpGet("performance")]
    public async Task<ActionResult<IEnumerable<DeliveryPerformanceDto>>> GetPerformance()
    {
        var results = await _queryService.GetDeliveryPerformanceAsync();
        return Ok(results);
    }

    [HttpGet("kpis")]
    public async Task<ActionResult<DeliveryKpiDto>> GetKpis()
    {
        var results = await _queryService.GetDeliveryKpisAsync();
        return Ok(results);
    }
}
