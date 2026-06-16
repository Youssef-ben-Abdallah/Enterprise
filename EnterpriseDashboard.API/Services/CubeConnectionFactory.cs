using Microsoft.AnalysisServices.AdomdClient;
using Microsoft.Extensions.Configuration;

namespace EnterpriseDashboard.API.Services;

public interface ICubeConnectionFactory
{
    AdomdConnection CreateConnection();
}

public class CubeConnectionFactory : ICubeConnectionFactory
{
    private readonly string _connectionString;

    public CubeConnectionFactory(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("SsasCube") 
            ?? "Data Source=DESKTOP-RAD617O\\MSSQLSERVER0; Catalog=EnterpriseCube;";
    }

    public AdomdConnection CreateConnection()
    {
        var connection = new AdomdConnection(_connectionString);
        connection.Open();
        return connection;
    }
}
