# Frontend Dashboard Application

A modern, highly responsive React dashboard styled with Vanilla CSS and Tailwind CSS, featuring glassmorphism elements, dynamic micro-animations, and full theme integration.

## Core Stack
- **Framework**: Vite + React + TypeScript
- **Visualizations**: Recharts (Custom multicolored charts, donut categories, area trends).
- **Mapping**: Leaflet + React-Leaflet (Geographic spend visualization with click-to-drill capabilities).
- **Routing**: React Router DOM
- **HTTP Client**: Axios with pre-configured API client instance.

## Installation & Setup

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (comes packaged with Node.js)

### Step-by-Step Installation

1. Navigate to this directory:
   ```bash
   cd EnterpriseDashboard.UI
   ```

2. Install all node dependencies:
   ```bash
   npm install
   ```

3. Launch the application locally in development mode:
   ```bash
   npm run dev
   ```

4. Build the production application bundle:
   ```bash
   npm run build
   ```

## Key Pages & Modules

- **Overview Dashboard**: High-level KPI widgets, contributing spenders, and logistics trend visualizers.
- **Product Analysis**: Category breakdowns and product metrics.
- **Locations**: Drill-down geographic map.
- **Time Intelligence**: Annual, quarterly, and monthly trend breakdowns.
- **Delivery Performance**: Interactive delay tracking tables with custom column filters.
