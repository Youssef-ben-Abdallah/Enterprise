using Microsoft.AspNetCore.Mvc;
using EnterpriseDashboard.API.Services;
using EnterpriseDashboard.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EnterpriseDashboard.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IMdxQueryService _queryService;

    public ProductsController(IMdxQueryService queryService)
    {
        _queryService = queryService;
    }

    [HttpGet("top")]
    public async Task<ActionResult<IEnumerable<SpendByDimensionDto>>> GetTopProducts(
        [FromQuery] int n = 10,
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
              [Measures].[Total Spend] ON COLUMNS,
              TOPCOUNT(
                [Dim Products].[Product Name].[Product Name].Members,
                {n},
                [Measures].[Total Spend]
              ) ON ROWS
            {subcube}";
            
        var results = await _queryService.GetSpendByDimensionAsync(mdx);
        return Ok(results);
    }
}
