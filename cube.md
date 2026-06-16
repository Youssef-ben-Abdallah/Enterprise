# OLAP Multi-dimensional Cube (SSAS)

This directory (`/EnterpriseCube`) contains the SQL Server Analysis Services (SSAS) Multidimensional project. It models enterprise procurement and logistics data to enable high-performance, complex analytical queries (MDX).

## Project Structure

- **`EnterpriseCube.dwproj`**: Visual Studio SSAS Project file.
- **`Enterprise DWH.ds`**: Data Source configuration pointing to the relational Data Warehouse.
- **`Enterprise DWH.dsv`**: Data Source View schema mapping the fact and dimension tables.
- **`Enterprise DWH.cube`**: The core multi-dimensional cube definition including measure groups and dimension relationships.

## Dimensional Model Design

The cube implements a star/snowflake schema with the following dimensions and measures:

### Dimensions

1. **Date (`Dim Date.dim`)**
   - Hierarchies: `Calendar Year -> Calendar Quarter -> Month Name -> Date`
   - Attributes: Day of Week, Year, Quarter, Month.

2. **Locations (`Dim Locations.dim`)**
   - Hierarchies: `Country -> State Province -> City`
   - Attributes: Country, Region, City.

3. **Products (`Dim Products.dim`)**
   - Hierarchies: `Product Category -> Product Subcategory -> Product Name`
   - Attributes: Category, Brand, Color, Weight.

4. **Suppliers (`Dim Suppliers.dim`)**
   - Hierarchies: `Supplier Category -> Supplier Name`
   - Attributes: Rating, Status, Payment Terms.

5. **Fact Purchases Dimension (`Fact Purchases.dim`)**
   - Enables degenerated dimension analysis directly on purchase order properties.

### Measures & Calculations

- **Spend Metrics**: `Total Spend` (Sum of Purchase Amount), `Average Spend`.
- **Logistics Metrics**: `Global Fill Rate`, `On-Time Delivery Rate`, `Average Delay Days`.
- **Order Metrics**: `Total Orders`, `Order Quantity`.

## Deployment

To deploy the cube:
1. Open the project in Visual Studio with SQL Server Data Tools (SSDT).
2. Configure the target Server in the project properties (e.g., `localhost` or specific SSAS instance).
3. Right-click the project and select **Deploy**.
4. Run the SQL Server Agent job or execute the SSIS ETL pipeline to process the cube data.
