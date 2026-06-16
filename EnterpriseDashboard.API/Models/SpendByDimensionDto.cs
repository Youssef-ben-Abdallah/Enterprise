namespace EnterpriseDashboard.API.Models;

public class SpendByDimensionDto
{
    public string Label { get; set; } = string.Empty;
    public decimal Value { get; set; } // TotalSpend
    public decimal? SecondaryValue { get; set; } // QtyOrdered or other measures
    public string? UniqueName { get; set; } // Unique name for drill-down
}
