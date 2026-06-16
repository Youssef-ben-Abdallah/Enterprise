using Microsoft.AspNetCore.Mvc;
using EnterpriseDashboard.API.Services;
using EnterpriseDashboard.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EnterpriseDashboard.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LocationsController : ControllerBase
{
    private readonly IMdxQueryService _queryService;

    public LocationsController(IMdxQueryService queryService)
    {
        _queryService = queryService;
    }

    [HttpGet("spend")]
    public async Task<ActionResult<IEnumerable<SpendByDimensionDto>>> GetSpend([FromQuery] string? parentMember)
    {
        var results = await _queryService.GetLocationSpendAsync(parentMember);
        return Ok(results);
    }
}
