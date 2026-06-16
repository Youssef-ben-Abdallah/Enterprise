using Microsoft.AspNetCore.Mvc;
using EnterpriseDashboard.API.Services;
using EnterpriseDashboard.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EnterpriseDashboard.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SpendController : ControllerBase
{
    private readonly IMdxQueryService _queryService;

    public SpendController(IMdxQueryService queryService)
    {
        _queryService = queryService;
    }

    [HttpGet("time")]
    public async Task<ActionResult<IEnumerable<SpendByDimensionDto>>> GetSpendByTime([FromQuery] int? year, [FromQuery] int? quarter)
    {
        var results = await _queryService.GetTimeIntelligenceAsync(year, quarter);
        return Ok(results);
    }

    [HttpGet("by-category")]
    public async Task<ActionResult<IEnumerable<SpendByDimensionDto>>> GetByCategory(
        [FromQuery] string month = null,
        [FromQuery] string supplier = null,
        [FromQuery] string country = null)
    {
        var filters = new List<string>();
        if (!string.IsNullOrEmpty(month)) filters.Add($"[Order Date].[Month Name].&[{month}]");
        if (!string.IsNullOrEmpty(supplier)) filters.Add($"[Dim Suppliers].[Supplier Name].&[{supplier}]");
        if (!string.IsNullOrEmpty(country)) filters.Add($"[Dim Locations].[Location].[Country].&[{country}]");

        string subcube = filters.Count > 0 
            ? $"FROM (SELECT {{ ( {string.Join(", ", filters)} ) }} ON COLUMNS FROM [Enterprise DWH])" 
            : "FROM [Enterprise DWH]";

        var mdx = $@"
            SELECT
              {{ [Measures].[Total Spend], [Measures].[Total Quantity Ordered] }} ON COLUMNS,
              [Dim Products].[Category Name].Children ON ROWS
            {subcube}";
        var results = await _queryService.GetSpendByDimensionAsync(mdx);
        return Ok(results);
    }

    [HttpGet("by-brand")]
    public async Task<ActionResult<IEnumerable<SpendByDimensionDto>>> GetByBrand()
    {
        var mdx = @"
            SELECT
              [Measures].[Total Spend] ON COLUMNS,
              [Dim Products].[Brand Name].Children ON ROWS
            FROM [Enterprise DWH]";
        var results = await _queryService.GetSpendByDimensionAsync(mdx);
        return Ok(results);
    }
}
