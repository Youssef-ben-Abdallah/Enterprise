$dll = "$PWD\bin\Debug\net10.0\Microsoft.AnalysisServices.AdomdClient.dll"
Add-Type -Path $dll
$conn = New-Object Microsoft.AnalysisServices.AdomdClient.AdomdConnection("Data Source=localhost;")
$conn.Open()
$ds = $conn.GetSchemaDataSet("DBSCHEMA_CATALOGS", $null)
$ds.Tables[0] | Select-Object CATALOG_NAME
$conn.Close()
