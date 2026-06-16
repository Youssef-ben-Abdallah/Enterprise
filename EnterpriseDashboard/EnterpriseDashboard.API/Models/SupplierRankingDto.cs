namespace EnterpriseDashboard.API.Models;

public class SupplierRankingDto
{
    public string SupplierName { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public decimal TotalSpend { get; set; }
    public decimal FillRate { get; set; }
    public int Ranking { get; set; }
}
