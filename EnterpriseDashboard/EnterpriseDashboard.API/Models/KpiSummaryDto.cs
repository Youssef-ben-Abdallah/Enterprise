namespace EnterpriseDashboard.API.Models;

public class KpiSummaryDto
{
    public decimal TotalSpend { get; set; }
    public int TotalOrders { get; set; }
    public decimal TotalQtyOrdered { get; set; }
    public decimal TotalQtyReceived { get; set; }
    public decimal FillRate { get; set; }
    public decimal AvgOrderValue { get; set; }
    public decimal YtdSpend { get; set; }
    public decimal SpendGrowth { get; set; }
}
