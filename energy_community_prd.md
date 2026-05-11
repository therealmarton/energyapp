# Product Requirements Document (PRD): Energy Community MVP

## 1. Project Overview & Goal
The objective is to build a Proof of Concept (POC) web application that simulates the internal settlement of a 6-member energy community, consisting of 3 prosumers and 3 consumers. The system uses an A/B test approach to compare traditional grid billing with a community-based P2P model, showcasing financial savings.

**Target Audience:** Energy community members who want a transparent view of their savings and energy sharing.
**Constraint Checklist:** No authentication required; hardcode the 6 users for testing.

## 2. Technology Stack
The AI must strictly adhere to the following stack:
* **Database:** PostgreSQL running in a local **Podman** container.
* **Backend:** Python **FastAPI** with **SQLAlchemy** (ORM) and **Alembic** (migrations).
* **Frontend:** **React**, styled with **Tailwind CSS**, and utilizing **TanStack** (Query and Router).
* **Testing (Strict TDD):** Frontend and E2E development must be Test-Driven using **Playwright**. Tests must be configured to run in **headed Chrome** for continuous visual testing during development.

## 3. Data Source Integration: PowerMocker v1.0
The system will not use real-time physical sensor data. Instead, it relies on "PowerMocker," a synthetic data generator.

* **Repository Structure:** The PowerMocker v1.0 project will be **cloned directly into the working repository**. The AI agent will have full local access to its source code (e.g., `generator.py`, `HP.py`, `WS.py`) and must manage its execution as a local process alongside the FastAPI backend.
* **Data Ingestion:** Create a webhook endpoint in FastAPI to receive batch payloads from the local PowerMocker instance.
* **Data Structure:** The payload includes 15-minute intervals with fields including `consumption_kwh`, `generation_kwh`, `net_grid_flow`, `meter_import_kwh`, and `meter_export_kwh`.
* **Aggregation Logic:** While PowerMocker sends 15-minute data, the business logic defines 60-minute (hourly) intervals for settlement. The backend must ingest the 15-minute chunks and aggregate them into hourly blocks for the financial calculations.
* **PowerMocker Modifications:** The AI is permitted to apply structural modifications to the cloned PowerMocker Python scripts to ensure perfect compatibility with the FastAPI backend, provided the core simulation logic (such as seasonality and weather anomalies) remains unchanged.
* **Data Management UI:**
    * Provide a dashboard feature to trigger a "Data Drop" (truncate the database) to allow fresh webhook uploads.
    * Implement a "Demo Mode" that allows users to filter and view calculations based on specific date windows.

## 4. Business Logic & Settlement Algorithm
The core of the application is the **Mid-Price Model (Középár-modell)**.

### 4.1. Pricing Parameters
The algorithm must treat the following as fixed variables:
* **Grid Buy (Hálózati vétel):** 40 Ft/kWh.
* **Grid Sell (Hálózati eladás):** 5 Ft/kWh.
* **Community Internal Price (Közösségi ár):** 22.5 Ft/kWh.

### 4.2. Calculation Steps (Hourly Execution)
1.  **Baseline Calculation:** Calculate what the household would pay without the community.
    $K\dot{olts\hat{e}g_{baseline,i}(t)=(E_{import,i}(t)\times40)-(E_{export,i}(t)\times5)$
2.  **Net Position:** Determine the aggregate community supply and demand.
3.  **Pro-Rata Allocation:** If demand exceeds solar surplus, distribute the community energy proportionally based on each consumer's deficit.
4.  **Financial Settlement:**
    * Shared community energy is billed at 22.5 Ft.
    * Unmet demand is bought from the grid at 40 Ft.
    * Unused excess solar is sold to the grid at 5 Ft.
    * Calculate the exact financial savings by subtracting the community model cost from the baseline cost.

## 5. System Entities & Hardcoded Users
The database must be seeded via Alembic or a FastAPI startup script with exactly 6 entities belonging to a single low-voltage transformer phase:
* **Prosumers (3 users):** Equipped with 5 kWp south-facing solar panels. Examples: `Haz_4_Solar_Idos`, `Haz_5_Solar_Csalad`, `Haz_6_Solar_Egyedul`.
* **Consumers (3 users):** Distinct consumption profiles. Example: `Haz_1_Idos`.

## 6. Frontend & UI Requirements (React + Tailwind)
The UI must focus on transparency and the A/B savings comparison.
* **Internationalization (i18n):** The application interface must be fully available in both **Hungarian** and **English** languages. The AI should use a standard library (like `react-i18next`) to implement a language toggle.
* **A/B Comparison Panel:** Interactive view contrasting "Without Community" vs "With Community" costs.
* **Prosumer Profit Increment:** Graph displaying how much extra revenue the prosumer earned selling at 22.5 Ft instead of 5 Ft.
* **Community Dashboard:** Global view of the 6 houses showing total aggregated savings and community self-sufficiency levels.
* **Real-time Monitoring & Source Definition:** Visual cues indicating whether current energy is drawn from solar or the grid.

## 7. Execution Guide for AI Agent (TDD Protocol)
1.  **Environment Setup:** Initialize the local Podman PostgreSQL container. Set up the FastAPI backend, the React frontend directories, and ensure the cloned PowerMocker directory is properly configured with its necessary Python dependencies.
2.  **Database & ORM:** Create SQLAlchemy models for `User` and `EnergyRecord`. Generate Alembic migrations. Create a seed script for the 6 hardcoded users.
3.  **Backend Logic:** Build the webhook receiver endpoint for PowerMocker. Implement the Mid-Price calculation logic as a service layer.
4.  **TDD Phase (Frontend):**
    * Write a Playwright test (headed Chrome) expecting a dashboard with a language selector (EN/HU), a specific date-window selector, and a "Drop Data" button.
    * Implement the React components to make the test pass.
    * Write a test expecting the A/B Comparison Panel to show specific mocked savings.
    * Implement the frontend logic using TanStack Query to fetch the aggregated settlement data from FastAPI.
5.  **Integration:** Execute the local PowerMocker script to send a test batch to the FastAPI webhook, verify database persistence, and validate that the React frontend updates the dashboards accurately.
