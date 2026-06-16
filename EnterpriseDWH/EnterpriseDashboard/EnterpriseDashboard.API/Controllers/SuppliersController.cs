using Microsoft.AspNetCore.Mvc;
using EnterpriseDashboard.API.Services;
using EnterpriseDashboard.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EnterpriseDashboard.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SuppliersController : ControllerBase
{
    private readonly IMdxQueryService _queryService;

    public SuppliersController(IMdxQueryService queryService)
    {
        _queryService = queryService;
    }

    [HttpGet("ranking")]
    public async Task<ActionResult<IEnumerable<SupplierRankingDto>>> GetRanking()
    {
        var results = await _queryService.GetSupplierRankingAsync();
        return Ok(results);
    }

    [HttpGet("spend")]
    public async Task<ActionResult<IEnumerable<SpendByDimensionDto>>> GetSpend([FromQuery] string supplierName)
    {
        var mdx = string.IsNullOrEmpty(supplierName)
            ? @"
                SELECT [Measures].[Total Spend] ON COLUMNS,
                [Order Date].[Calendar].[Year].Members ON ROWS
                FROM [Enterprise DWH]"
            : $@"
                SELECT [Measures].[Total Spend] ON COLUMNS,
                [Order Date].[Calendar].[Year].Members ON ROWS
                FROM (SELECT {{ [Dim Suppliers].[Supplier Name].&[{supplierName}] }} ON COLUMNS FROM [Enterprise DWH])";
        var results = await _queryService.GetSpendByDimensionAsync(mdx);
        return Ok(results);
    }
}
