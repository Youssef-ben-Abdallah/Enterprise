[System.Reflection.Assembly]::LoadWithPartialName("Microsoft.AnalysisServices")
$s = New-Object Microsoft.AnalysisServices.Server
$s.Connect("localhost")
$s.Databases | Select-Object Name
