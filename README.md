# Enterprise Procurement Analytics Dashboard

A modern, full-stack enterprise data warehouse and business intelligence dashboard for procurement and logistics tracking. 

## System Architecture

The project consists of three main components:

1. **Data Warehouse & ETL Pipeline (SSIS)**:
   - SSIS Packages (`Dimensions.dtsx`, `Fact.dtsx`) to extract, transform, and load source data into the Enterprise Data Warehouse.
   - OLAP Multi-dimensional Cube (SSAS) definition for dimensional modeling (Geography, Suppliers, Products, Date, and Time).

2. **Web API Service (`/EnterpriseDashboard.API`)**:
   - Built on **ASP.NET Core**.
   - Interfaces directly with the SSAS OLAP cube via connection strings executing MDX (Multi-Dimensional eXpressions) queries.
   - Exposes REST API endpoints for KPI summaries, drill-downs, filters, rankings, and logistics performance.

3. **Frontend Dashboard (`/EnterpriseDashboard.UI`)**:
   - Built with **Vite**, **React**, **TypeScript**, and **Tailwind CSS**.
   - Fully interactive visualizations using **Recharts** (multicolored bar charts, area charts, and custom label donut charts).
   - Dynamic leaflet maps for geographic spend drill-downs.
   - Modern glassmorphism UI with seamless Light/Dark mode support.

## Key Features

- **Overview Dashboard**: High-level KPIs (Total Spend, YTD Spend, Global Fill Rate, Total Orders), Top Contributors (#1 Product, #1 Supplier, #1 Location), Logistics Health (On-Time rate), and custom bottom-row widgets for Inventory Volume, Logistics Precision, and Spend Trend charts.
- **Product Analysis**: Spend by Category (donut chart with clean label connectors) and Top 10 Products by Spend (horizontal bar chart).
- **Location Drilldowns**: Interactive geographic map representation of Spend by Location with click-to-drill-down capabilities and dynamic bar/table views.
- **Time Intelligence**: Annual, quarterly, and daily breakdown trends with interactive click-to-drill-down on years and quarters.
- **Delivery Performance**: Purchase Order tracking table showing delivery status, delay days, actual/expected dates, and column filters.

## Getting Started

### Prerequisites

- .NET 8 SDK (for API service)
- Node.js (v18+ recommended for Frontend)
- SQL Server, SSIS, and SSAS (OLAP Cube) installed and running

### Running the API

1. Navigate to the API directory:
   ```bash
   cd EnterpriseDashboard/EnterpriseDashboard.API
   ```
2. Run the development server:
   ```bash
   dotnet run
   ```
   The API will start on `http://localhost:5002` (or configured port).

### Running the Frontend

1. Navigate to the UI directory:
   ```bash
   cd EnterpriseDashboard/EnterpriseDashboard.UI
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.
