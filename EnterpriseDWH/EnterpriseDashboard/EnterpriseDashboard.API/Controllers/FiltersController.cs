using Microsoft.AspNetCore.Mvc;
using EnterpriseDashboard.API.Services;
using EnterpriseDashboard.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EnterpriseDashboard.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FiltersController : ControllerBase
{
    private readonly IMdxQueryService _queryService;

    public FiltersController(IMdxQueryService queryService)
    {
        _queryService = queryService;
    }

    [HttpGet("years")]
    public async Task<ActionResult<IEnumerable<FilterDto>>> GetYears()
    {
        var results = await _queryService.GetFiltersAsync("[Dim Date].[Calendar].[Year]");
        return Ok(results);
    }

    [HttpGet("categories")]
    public async Task<ActionResult<IEnumerable<FilterDto>>> GetCategories()
    {
        var results = await _queryService.GetFiltersAsync("[Dim Products].[Product].[Category Name]");
        return Ok(results);
    }

    [HttpGet("suppliers")]
    public async Task<ActionResult<IEnumerable<FilterDto>>> GetSuppliers()
    {
        var results = await _queryService.GetFiltersAsync("[Dim Suppliers].[Supplier Name].[Supplier Name]");
        return Ok(results);
    }

    [HttpGet("locations")]
    public async Task<ActionResult<IEnumerable<FilterDto>>> GetLocations()
    {
        var results = await _queryService.GetFiltersAsync("[Dim Locations].[Location].[Country]");
        return Ok(results);
    }

    [HttpGet("months")]
    public async Task<ActionResult<IEnumerable<FilterDto>>> GetMonths()
    {
        var results = await _queryService.GetFiltersAsync("[Order Date].[Month Name]");
        return Ok(results);
    }
}
