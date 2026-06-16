using System;
using Microsoft.AnalysisServices.AdomdClient;

namespace MdxTester
{
    class Program
    {
        static void Main(string[] args)
        {
            try
            {
                using var conn = new AdomdConnection("Data Source=DESKTOP-RAD617O\\MSSQLSERVER0;Catalog=EnterpriseCube;");
                conn.Open();

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

                using var cmd = new AdomdCommand(mdx, conn);
                using var reader = cmd.ExecuteReader();

                int count = 0;
                while (reader.Read() && count < 10)
                {
                    Console.WriteLine($"ExpKey: {reader[3]} | ActKey: {reader[4]} | Delay: {reader[6]}");
                    count++;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error: " + ex.Message);
            }
        }
    }
}
