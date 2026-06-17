# Backend Web API Service

Built on **ASP.NET Core Web API**, the backend queries the SSAS multi-dimensional cube via XMLA/ADOMD.NET to deliver high-performance aggregated REST endpoints.

## Core Stack & Architecture
- **Framework**: .NET 8.0 Core
- **Data Access**: `Microsoft.AnalysisServices.AdomdClient` executing raw MDX queries against the OLAP server.
- **Dependency Injection**: Registered factories (`CubeConnectionFactory`) to manage client connection lifecycles.

## REST API Endpoints

### 1. KPI Summaries
- **`GET /api/kpis/summary`**: Returns high-level metrics:
  - Total Spend (all-time)
  - Year-to-Date (YTD) Spend
  - Global Fill Rate (%)
  - Total Order Count
  - Average Delay Days (Logistics precision)

### 2. Spend Metrics
- **`GET /api/spend/by-category`**: Returns spend grouped by product categories.
- **`GET /api/spend/top-products`**: Returns the top products sorted by total spend.
- **`GET /api/spend/by-quarter?year={year}`**: Returns quarterly spend trends for the given year.
- **`GET /api/spend/by-month?year={year}&quarter={quarter}`**: Returns monthly spend trends.

### 3. Locations
- **`GET /api/locations/spend`**: Returns geographic spend aggregated by country/state/city.
- **`GET /api/locations/parent`**: Returns hierarchical locations.

### 4. Suppliers
- **`GET /api/suppliers/rankings`**: Returns vendor rankings based on spend volume and delivery precision.

### 5. Delivery Performance
- **`GET /api/delivery/performance`**: Returns details on purchase orders, delay days, status (On-Time, Delayed, etc.) and expected/actual delivery timelines.

## Running the API
1. Verify the connection string in `appsettings.json` points to the deployed SSAS instance.
2. Navigate to this directory and run:
   ```bash
   dotnet run
   ```
   The API will listen on `http://localhost:5002`.
