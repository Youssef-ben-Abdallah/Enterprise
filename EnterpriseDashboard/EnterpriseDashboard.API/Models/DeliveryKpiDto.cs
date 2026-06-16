namespace EnterpriseDashboard.API.Models;

public class DeliveryKpiDto
{
    public int TotalDeliveries { get; set; }
    public double EarlyPercentage { get; set; }
    public double LatePercentage { get; set; }
    public double OnTimePercentage { get; set; }
}
