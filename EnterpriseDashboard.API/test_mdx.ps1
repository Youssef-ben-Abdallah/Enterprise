$dll = "D:\DWarehouse\EnterpriseProject\EnterpriseDWH\EnterpriseDashboard\EnterpriseDashboard.API\bin\Debug\net10.0\Microsoft.AnalysisServices.AdomdClient.dll"
Add-Type -Path $dll
$conn = New-Object Microsoft.AnalysisServices.AdomdClient.AdomdConnection("Data Source=DESKTOP-RAD617O\MSSQLSERVER0;Catalog=EnterpriseCube;")
$conn.Open()

function Run-Mdx($mdx) {
    Write-Host "Executing MDX:`n$mdx"
    $cmd = New-Object Microsoft.AnalysisServices.AdomdClient.AdomdCommand($mdx, $conn)
    try {
        $reader = $cmd.ExecuteReader()
        while ($reader.Read()) {
            $row = @()
            for ($i = 0; $i -lt $reader.FieldCount; $i++) {
                $val = if ($reader.IsDBNull($i)) { "NULL" } else { $reader.GetValue($i).ToString() }
                $row += $val
            }
            Write-Host ($row -join " | ")
        }
        $reader.Close()
    } catch {
        Write-Host "ERROR: $_"
    }
    Write-Host "--------------------------------"
}

Run-Mdx "SELECT [Measures].[Total Spend] ON COLUMNS, [Dim Products].[Category Name].[Category Name].Members ON ROWS FROM [Enterprise DWH]"
Run-Mdx "SELECT [Measures].[Total Spend] ON COLUMNS, [Dim Suppliers].[Supplier ID].[Supplier ID].Members ON ROWS FROM [Enterprise DWH]"
Run-Mdx "SELECT [Measures].[Total Spend] ON COLUMNS, [Dim Locations].[Country].[Country].Members ON ROWS FROM [Enterprise DWH]"

$conn.Close()
