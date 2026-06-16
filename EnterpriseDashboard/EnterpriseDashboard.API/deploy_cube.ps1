$xml = Get-Content "D:\DWarehouse\EnterpriseCube\bin\EnterpriseCube.asdatabase" -Raw
$xmla = "<Create xmlns=`"http://schemas.microsoft.com/analysisservices/2003/engine`"><ObjectDefinition>$xml</ObjectDefinition></Create>"

$dll = "$PWD\bin\Debug\net10.0\Microsoft.AnalysisServices.AdomdClient.dll"
Add-Type -Path $dll
$conn = New-Object Microsoft.AnalysisServices.AdomdClient.AdomdConnection("Data Source=localhost;")
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = $xmla
$cmd.ExecuteNonQuery()
$conn.Close()
Write-Host "Deployment successful!"
