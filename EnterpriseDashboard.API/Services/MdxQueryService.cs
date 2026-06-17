using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Microsoft.AnalysisServices.AdomdClient;
using EnterpriseDashboard.API.Models;

namespace EnterpriseDashboard.API.Services;

public interface IMdxQueryService
{
    Task<KpiSummaryDto> GetKpiSummaryAsync();
    Task<IEnumerable<SpendByDimensionDto>> GetSpendByDimensionAsync(string mdxQuery);
    Task<IEnumerable<SupplierRankingDto>> GetSupplierRankingAsync();
    Task<IEnumerable<DeliveryPerformanceDto>> GetDeliveryPerformanceAsync();
    Task<DeliveryKpiDto> GetDeliveryKpisAsync();
    Task<IEnumerable<FilterDto>> GetFiltersAsync(string dimensionLevel);
    Task<IEnumerable<SpendByDimensionDto>> GetTimeIntelligenceAsync(int? year, int? quarter);
    Task<IEnumerable<SpendByDimensionDto>> GetLocationSpendAsync(string parentMember);
}

public class MdxQueryService : IMdxQueryService
{
    private readonly ICubeConnectionFactory _connectionFactory;

    public MdxQueryService(ICubeConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<KpiSummaryDto> GetKpiSummaryAsync()
    {
        var mdx = @"
            ";

        using var connection = _connectionFactory.CreateConnection();
        using var command = new AdomdCommand(mdx, connection);
        // Using Task.Run because AdomdCommand doesn't have true async ExecuteReader in older implementations
        // but we simulate it for the API pattern.
        using var reader = await Task.Run(() => command.ExecuteReader());
        
        var summary = new KpiSummaryDto();
        if (reader.Read())
        {
            summary.TotalSpend = GetDecimalSafe(reader, 0);
            summary.TotalOrders = (int)GetDecimalSafe(reader, 1);
            summary.FillRate = GetDecimalSafe(reader, 2);
            summary.YtdSpend = GetDecimalSafe(reader, 3);
            summary.SpendGrowth = GetDecimalSafe(reader, 4);
            summary.AvgOrderValue = GetDecimalSafe(reader, 5);
            summary.TotalQtyOrdered = GetDecimalSafe(reader, 6);
            summary.TotalQtyReceived = GetDecimalSafe(reader, 7);
        }
        return summary;
    }

    public async Task<IEnumerable<SpendByDimensionDto>> GetSpendByDimensionAsync(string mdxQuery)
    {
        var results = new List<SpendByDimensionDto>();
        using var connection = _connectionFactory.CreateConnection();
        using var command = new AdomdCommand(mdxQuery, connection);
        using var reader = await Task.Run(() => command.ExecuteReader());

        while (reader.Read())
        {
            if (reader.FieldCount < 2) continue;
            
            results.Add(new SpendByDimensionDto
            {
                Label = reader[0]?.ToString() ?? "Unknown",
                Value = GetDecimalSafe(reader, 1),
                SecondaryValue = reader.FieldCount > 2 ? GetDecimalSafe(reader, 2) : null
            });
        }
        return results;
    }

    public async Task<IEnumerable<SpendByDimensionDto>> GetTimeIntelligenceAsync(int? year, int? quarter)
    {
        string mdx = "";
        int labelIndex = 0;
        int valueIndex = 1;

        if (!year.HasValue)
        {
            // Root Level: Years
            mdx = @"
                SELECT [Measures].[Total Spend] ON COLUMNS,
                NON EMPTY [Order Date].[Calendar].[Year].Members ON ROWS
                FROM [Enterprise DWH]";
            labelIndex = 0;
            valueIndex = 1;
        }
        else if (!quarter.HasValue)
        {
            // Drill down 1: Quarters of a specific year
            mdx = $@"
                SELECT [Measures].[Total Spend] ON COLUMNS,
                NON EMPTY DESCENDANTS([Order Date].[Calendar].[Year].&[{year.Value}], 1, SELF) ON ROWS
                FROM [Enterprise DWH]";
            labelIndex = 1; // 0=Year, 1=Quarter
            valueIndex = 2; // Measure
        }
        else
        {
            // Drill down 2: Days of a specific quarter (Distance 2 because Month Name was added)
            mdx = $@"
                SELECT [Measures].[Total Spend] ON COLUMNS,
                NON EMPTY DESCENDANTS([Order Date].[Calendar].[Year].&[{year.Value}].&[{quarter.Value}], 2, SELF) ON ROWS
                FROM [Enterprise DWH]";
            labelIndex = 3; // 0=Year, 1=Quarter, 2=Month Name, 3=Day Of Month
            valueIndex = 4; // Measure
        }

        var results = new List<SpendByDimensionDto>();
        using var connection = _connectionFactory.CreateConnection();
        using var command = new AdomdCommand(mdx, connection);
        using var reader = await Task.Run(() => command.ExecuteReader());

        while (reader.Read())
        {
            if (reader.FieldCount <= valueIndex) continue;

            string rawLabel = reader[labelIndex]?.ToString() ?? "Unknown";
            string displayLabel = rawLabel;

            if (year.HasValue && !quarter.HasValue)
            {
                displayLabel = "Q" + rawLabel;
            }
            else if (year.HasValue && quarter.HasValue)
            {
                if (int.TryParse(rawLabel, out int dayNum))
                {
                    displayLabel = "Day " + dayNum.ToString("D2");
                }
                else
                {
                    displayLabel = "Day " + rawLabel;
                }
            }

            results.Add(new SpendByDimensionDto
            {
                Label = displayLabel,
                Value = GetDecimalSafe(reader, valueIndex)
            });
        }
        return results;
    }

    public async Task<IEnumerable<SpendByDimensionDto>> GetLocationSpendAsync(string parentMember)
    {
        string mdx;
        
        if (string.IsNullOrEmpty(parentMember))
        {
            // Root level
            mdx = @"
                WITH MEMBER [Measures].[UniqueName] AS [Dim Locations].[Location].CurrentMember.UniqueName
                SELECT { [Measures].[Total Spend], [Measures].[Total Quantity Received], [Measures].[UniqueName] } ON COLUMNS,
                NON EMPTY [Dim Locations].[Location].Children ON ROWS
                FROM [Enterprise DWH]";
        }
        else
        {
            // Drill down
            mdx = $@"
                WITH MEMBER [Measures].[UniqueName] AS [Dim Locations].[Location].CurrentMember.UniqueName
                SELECT {{ [Measures].[Total Spend], [Measures].[Total Quantity Received], [Measures].[UniqueName] }} ON COLUMNS,
                NON EMPTY DESCENDANTS({parentMember}, 1, SELF) ON ROWS
                FROM [Enterprise DWH]";
        }

        var results = new List<SpendByDimensionDto>();
        using var connection = _connectionFactory.CreateConnection();
        using var command = new AdomdCommand(mdx, connection);
        using var reader = await Task.Run(() => command.ExecuteReader());

        while (reader.Read())
        {
            if (reader.FieldCount < 4) continue; // Minimum required columns
            
            int labelIndex = reader.FieldCount - 4;
            int spendIndex = reader.FieldCount - 3;
            int qtyIndex = reader.FieldCount - 2;
            int uniqueNameIndex = reader.FieldCount - 1;

            string label = reader[labelIndex]?.ToString() ?? "Unknown";
            // Ignore Unknown member if present
            if (label == "Unknown") continue;

            results.Add(new SpendByDimensionDto
            {
                Label = label,
                Value = GetDecimalSafe(reader, spendIndex),
                SecondaryValue = GetDecimalSafe(reader, qtyIndex),
                UniqueName = reader[uniqueNameIndex]?.ToString()
            });
        }
        return results;
    }

    public async Task<IEnumerable<SupplierRankingDto>> GetSupplierRankingAsync()
    {
        var mdx = @"
            SELECT
              { [Measures].[Total Spend], [Measures].[Fill Rate] } ON COLUMNS,
              TOPCOUNT(
                NONEMPTY(
                  [Dim Suppliers].[Supplier Name].[Supplier Name].Members * 
                  [Dim Suppliers].[Country].[Country].Members * 
                  [Dim Suppliers].[City].[City].Members,
                  [Measures].[Total Spend]
                ),
                50,
                [Measures].[Total Spend]
              ) ON ROWS
            FROM [Enterprise DWH]";

        var results = new List<SupplierRankingDto>();
        using var connection = _connectionFactory.CreateConnection();
        using var command = new AdomdCommand(mdx, connection);
        using var reader = await Task.Run(() => command.ExecuteReader());

        int rank = 1;
        while (reader.Read())
        {
            var supplierName = reader[0]?.ToString() ?? "Unknown";
            if (supplierName == "Unknown" || supplierName == "UnknownMember" || supplierName == "") continue;

            results.Add(new SupplierRankingDto
            {
                SupplierName = supplierName,
                Country = reader[1]?.ToString() ?? "N/A",
                City = reader[2]?.ToString() ?? "N/A",
                TotalSpend = GetDecimalSafe(reader, 3),
                FillRate = GetDecimalSafe(reader, 4) * 100,
                Ranking = rank++
            });
        }
        return results;
    }

    public async Task<IEnumerable<DeliveryPerformanceDto>> GetDeliveryPerformanceAsync()
    {
        var productMap = await GetProductDictionaryAsync();
        var supplierMap = await GetSupplierDictionaryAsync();

        var mdx = @"
            SELECT 
              { [Measures].[Fact Purchases Count], [Measures].[Delay Days] } ON COLUMNS,
              NON EMPTY [Fact Purchases].[PO Detail ID].[PO Detail ID].Members
              DIMENSION PROPERTIES 
                  MEMBER_CAPTION,
                  [Fact Purchases].[PO Detail ID].[Product ID],
                  [Fact Purchases].[PO Detail ID].[Supplier ID],
                  [Fact Purchases].[PO Detail ID].[Expected Delivery Date Key],
                  [Fact Purchases].[PO Detail ID].[Actual Delivery Date Key]
              ON ROWS
            FROM [Enterprise DWH]";

        var results = new List<DeliveryPerformanceDto>();
        using var connection = _connectionFactory.CreateConnection();
        using var command = new AdomdCommand(mdx, connection);
        using var reader = await Task.Run(() => command.ExecuteReader());
        
        while (reader.Read())
        {
            if (reader.FieldCount < 7) continue;

            var poDetailId = reader[0]?.ToString() ?? "";
            var productId = reader[1]?.ToString() ?? "";
            var supplierId = reader[2]?.ToString() ?? "";
            var expectedKey = reader[3]?.ToString() ?? "";
            var actualKey = reader[4]?.ToString() ?? "";
            var delayDays = reader.IsDBNull(6) ? 0 : Convert.ToInt32(reader[6]);

            var expectedDate = ParseDateKey(expectedKey);
            var actualDate = ParseDateKey(actualKey);

            string status = "Pending";
            if (actualKey != "0" && !string.IsNullOrEmpty(actualKey))
            {
                if (delayDays > 0) status = "Late";
                else if (delayDays < 0) status = "Early";
                else status = "On Time";
            }
            else if (delayDays != 0) 
            {
                if (delayDays > 0) status = "Late";
                else if (delayDays < 0) status = "Early";
            }

            var prodName = productMap.TryGetValue(productId, out var pName) ? pName : "Product " + productId;
            var suppName = supplierMap.TryGetValue(supplierId, out var sName) ? sName : "Supplier " + supplierId;

            results.Add(new DeliveryPerformanceDto
            {
                PoId = "PO-" + poDetailId,
                Supplier = suppName,
                Product = prodName,
                OrderDate = expectedDate != DateTime.MinValue ? expectedDate.AddDays(-14) : DateTime.Today.AddDays(-30),
                ExpectedDate = expectedDate != DateTime.MinValue ? expectedDate : DateTime.Today.AddDays(-14),
                ActualDate = actualDate != DateTime.MinValue ? actualDate : (expectedDate != DateTime.MinValue ? expectedDate.AddDays(delayDays) : DateTime.Today.AddDays(-14 + delayDays)),
                DelayDays = delayDays,
                Status = status
            });
        }
        return results;
    }

    private async Task<Dictionary<string, string>> GetProductDictionaryAsync()
    {
        var dict = new Dictionary<string, string>();
        var mdx = @"
            SELECT { [Measures].[Total Spend] } ON COLUMNS,
            NON EMPTY [Dim Products].[Product ID].[Product ID].Members
            DIMENSION PROPERTIES MEMBER_KEY, [Dim Products].[Product ID].[Product Name] ON ROWS
            FROM [Enterprise DWH]";
        
        using var connection = _connectionFactory.CreateConnection();
        using var command = new AdomdCommand(mdx, connection);
        using var reader = await Task.Run(() => command.ExecuteReader());
        while (reader.Read())
        {
            if (reader.FieldCount >= 2)
            {
                var id = reader[0]?.ToString();
                var name = reader[1]?.ToString();
                if (!string.IsNullOrEmpty(id) && !string.IsNullOrEmpty(name)) dict[id] = name;
            }
        }
        return dict;
    }

    private async Task<Dictionary<string, string>> GetSupplierDictionaryAsync()
    {
        var dict = new Dictionary<string, string>();
        var mdx = @"
            SELECT { [Measures].[Total Spend] } ON COLUMNS,
            NON EMPTY [Dim Suppliers].[Supplier ID].[Supplier ID].Members
            DIMENSION PROPERTIES MEMBER_KEY, [Dim Suppliers].[Supplier ID].[Supplier Name] ON ROWS
            FROM [Enterprise DWH]";
        
        using var connection = _connectionFactory.CreateConnection();
        using var command = new AdomdCommand(mdx, connection);
        using var reader = await Task.Run(() => command.ExecuteReader());
        while (reader.Read())
        {
            if (reader.FieldCount >= 2)
            {
                var id = reader[0]?.ToString();
                var name = reader[1]?.ToString();
                if (!string.IsNullOrEmpty(id) && !string.IsNullOrEmpty(name)) dict[id] = name;
            }
        }
        return dict;
    }

    public async Task<DeliveryKpiDto> GetDeliveryKpisAsync()
    {
        var performance = await GetDeliveryPerformanceAsync();
        
        int total = 0, early = 0, late = 0, onTime = 0;
        foreach (var p in performance)
        {
            total++;
            if (p.Status == "Early") early++;
            else if (p.Status == "Late") late++;
            else if (p.Status == "On Time") onTime++;
        }

        return new DeliveryKpiDto
        {
            TotalDeliveries = total,
            EarlyPercentage = total == 0 ? 0 : Math.Round((double)early / total * 100, 1),
            LatePercentage = total == 0 ? 0 : Math.Round((double)late / total * 100, 1),
            OnTimePercentage = total == 0 ? 0 : Math.Round((double)onTime / total * 100, 1)
        };
    }

    private DateTime ParseDateKey(string key)
    {
        if (string.IsNullOrEmpty(key) || key == "0" || key.Length != 8) 
            return DateTime.MinValue;

        if (int.TryParse(key.Substring(0, 4), out int year) &&
            int.TryParse(key.Substring(4, 2), out int month) &&
            int.TryParse(key.Substring(6, 2), out int day))
        {
            try { return new DateTime(year, month, day); } catch { }
        }
        return DateTime.MinValue;
    }

    public async Task<IEnumerable<FilterDto>> GetFiltersAsync(string dimensionLevel)
    {
        var mdx = $@"
            SELECT {{ [Measures].[Total Spend] }} ON COLUMNS,
            NON EMPTY {dimensionLevel}.Members ON ROWS
            FROM [Enterprise DWH]";

        var results = new List<FilterDto>();
        using var connection = _connectionFactory.CreateConnection();
        using var command = new AdomdCommand(mdx, connection);
        using var reader = await Task.Run(() => command.ExecuteReader());

        while (reader.Read())
        {
            var val = reader[0]?.ToString()?.Trim() ?? "";
            if (!string.IsNullOrEmpty(val) && val != "All") // Usually ignore the 'All' member
            {
                results.Add(new FilterDto
                {
                    Label = val,
                    Value = val
                });
            }
        }
        return results;
    }

    private decimal GetDecimalSafe(AdomdDataReader reader, int index)
    {
        if (reader.IsDBNull(index)) return 0m;
        try
        {
            return Convert.ToDecimal(reader[index]);
        }
        catch
        {
            return 0m;
        }
    }
}
