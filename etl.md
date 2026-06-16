# ETL Pipeline & Data Warehouse (SSIS)

This directory (`/EnterpriseDWH`) contains the SQL Server Integration Services (SSIS) project responsible for the Extract, Transform, and Load (ETL) pipeline. It populates the Enterprise Data Warehouse from transactional source databases.

## Project Structure

- **`EnterpriseDWH.dtproj`**: Visual Studio SSIS Project file.
- **`Project.params`**: Configuration parameters for database connections and environment flags.
- **`Dimensions.dtsx`**: SSIS package designed to extract and load dimension tables.
- **`Fact.dtsx`**: SSIS package designed to load the core purchase facts.

## ETL Packages Workflow

### 1. Dimensions Package (`Dimensions.dtsx`)
Extracts and loads master data into the dimensional tables with Slowly Changing Dimension (SCD) handling:
- **Supplier Dimension**: Synchronizes vendor profiles, ratings, and categories.
- **Product Dimension**: Maps categories, subcategories, brands, and items.
- **Location Dimension**: Updates geography mappings (Cities, States, Countries).
- **Date Dimension**: Pre-populates calendar attributes, fiscal quarters, and time Hierarchies.

### 2. Fact Package (`Fact.dtsx`)
Extracts transaction logs and loads them into the fact tables:
- **Fact Purchases**: Joins source transactional purchase orders with surrogate keys from dimensions, calculating spend amounts, delivery lead times, and status metrics.
- Cleanses missing keys and applies default values for unresolved references.

## Execution

1. Open `EnterpriseDWH.dtproj` in Visual Studio SSDT.
2. Verify connection managers point to the correct staging/OLTP and target DWH instances.
3. Execute `Dimensions.dtsx` first to establish dimension keys, then execute `Fact.dtsx`.
4. Deploy the packages to the Integration Services Catalog (SSISDB) for automated SQL Agent scheduling.
