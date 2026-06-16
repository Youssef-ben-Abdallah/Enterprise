# Enterprise Dashboard: Frontend & Backend

This documentation covers the frontend UI and backend API components of the Enterprise Procurement Analytics Dashboard. Both projects reside at the root of the repository.

---

## 1. Backend Service (`/EnterpriseDashboard.API`)

Built on **ASP.NET Core Web API**, the backend queries the SSAS multi-dimensional cube via XMLA/ADOMD.NET to deliver high-performance aggregated REST endpoints.

### Core Stack & Architecture
- **Framework**: .NET 8.0 Core
- **Data Access**: `Microsoft.AnalysisServices.AdomdClient` executing raw MDX queries against the OLAP server.
- **Dependency Injection**: Registered factories (`CubeConnectionFactory`) to manage client connection lifecycles.
- **Controllers**:
  - `KpisController`: Aggregates Overview KPIs (Total Spend, Fill Rate, Lead Times).
  - `SpendController`: Handles time and product subcategory spend trend queries.
  - `LocationsController`: Powers geographic spend drill-downs.
  - `SuppliersController`: Computes vendor rankings.
  - `DeliveryController`: Feeds the interactive delivery delay tracking table.

### Run Instructions
1. Verify the connection string in `appsettings.json` points to the deployed SSAS instance.
2. Navigate to the API folder:
   ```bash
   cd EnterpriseDashboard.API
   ```
3. Launch the development server:
   ```bash
   dotnet run
   ```
   The API will listen on `http://localhost:5002`.

---

## 2. Frontend Application (`/EnterpriseDashboard.UI`)

A modern, highly responsive React dashboard styled with Vanilla CSS and Tailwind CSS, featuring glassmorphism elements, dynamic micro-animations, and full theme integration.

### Core Stack
- **Framework**: Vite + React + TypeScript
- **Visualizations**: Recharts (Custom multicolored charts, donut categories, area trends).
- **Mapping**: Leaflet + React-Leaflet (Geographic spend visualization with click-to-drill capabilities).
- **Routing**: React Router DOM
- **HTTP Client**: Axios with pre-configured API client instance.

### Run Instructions
1. Navigate to the UI folder:
   ```bash
   cd EnterpriseDashboard.UI
   ```
2. Install node dependencies:
   ```bash
   npm install
   ```
3. Launch the application locally:
   ```bash
   npm run dev
   ```
   Access the dashboard at `http://localhost:5173`.
