$dll = "D:\DWarehouse\EnterpriseProject\EnterpriseDWH\EnterpriseDashboard\EnterpriseDashboard.API\bin\Debug\net10.0\Microsoft.AnalysisServices.AdomdClient.dll"
Add-Type -Path $dll
$conn = New-Object Microsoft.AnalysisServices.AdomdClient.AdomdConnection("Data Source=DESKTOP-RAD617O\MSSQLSERVER0;Catalog=EnterpriseCube;")
$conn.Open()
$ds = $conn.GetSchemaDataSet("MDSCHEMA_HIERARCHIES", $null)
$ds.Tables[0] | Select-Object DIMENSION_UNIQUE_NAME, HIERARCHY_UNIQUE_NAME | Format-Table -AutoSize
$conn.Close()
