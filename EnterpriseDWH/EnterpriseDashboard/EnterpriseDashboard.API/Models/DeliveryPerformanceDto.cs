using System;

namespace EnterpriseDashboard.API.Models;

public class DeliveryPerformanceDto
{
    public string PoId { get; set; } = string.Empty;
    public string Supplier { get; set; } = string.Empty;
    public string Product { get; set; } = string.Empty;
    public DateTime? OrderDate { get; set; }
    public DateTime? ExpectedDate { get; set; }
    public DateTime? ActualDate { get; set; }
    public int DelayDays { get; set; }
    public string Status { get; set; } = string.Empty;
}
