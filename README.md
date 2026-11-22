# EcoMind – Digital Carbon Footprint Prediction & Reduction System

An eco-friendly, modern web application designed to track, estimate, predict, and reduce digital carbon emissions across AI usage, Cloud Storage, Data Transfers, and Computing Time.

## 🚀 Key Features

- **Step 1: Auth (`/auth`)**
  - Left branding panel featuring eco illustration & handwritten slogan: *“Smarter Digital Choices for a Greener Tomorrow”*.
  - Dual connected cards: **Create Account** and **Welcome Back** with animated flow arrow.
  - Form validation with eye-toggle password security, Google OAuth action, and one-click demo login for **Khasim Sab**.
  - Right panel highlighting Secure Login, Personalized Dashboard, and Make a Difference with the CO₂ laptop illustration.

- **Step 2: Digital Activity Input (`/add-activity`)**
  - 2×2 grid of activity inputs with category accents:
    - **AI Usage** (Purple): queries or hours toggle, AI tool selector (ChatGPT, Copilot, Gemini...).
    - **Cloud Storage** (Blue): GB, active days, provider selector (Google Drive, AWS, Dropbox...).
    - **Data Transfers** (Green): GB volume, transfer type (Upload, Download, Streaming, Sync).
    - **Computing Time** (Amber): hours, resource type selector (Cloud GPU, VM, local workstation).
  - Real-time live **Estimated Emissions** calculation box inside each card.
  - Activity Summary panel with category breakdowns, total kWh and kg CO₂e, tree/smartphone equivalents, rotating eco tips, and a **Save Activity** button that persists to global state and proceeds to Step 3.

- **Step 3: Data Processing & Emission Estimation (`/processing`)**
  - Interactive 4-step flow strip: *Activity Data ➔ Apply Emission Factors ➔ Calculate Emissions ➔ Results*.
  - **Processing Complete** banner with direct navigation to the ML Report.
  - Total Estimated Emissions bar (Energy kWh, CO₂e kg, grid carbon intensity).
  - Detailed telemetry table with filtering (Last 7 Days, Last 30 Days, All Records), search, CSV export, and category badges.
  - Documented Emission Factors reference table:
    - AI: `0.002 kWh / query` (OpenAI / MIT Life-Cycle Study)
    - Cloud Storage: `0.02 kWh / GB / month` (Cloud Carbon Footprint standard)
    - Data Transfers: `0.03 kWh / GB` (The Shift Project & IEA)
    - Computing: `0.05 kWh / hour` (Green Software Foundation)
    - Grid Emission Factor: `0.475 kg CO₂e / kWh` (Global Average)

- **Step 4: Machine Learning Prediction (`/machine-learning`)**
  - 4 Tabs: *Prediction Overview*, *Model Details & Architecture*, *Historical Training Data*, *Future Scenarios (Net-Zero)*.
  - 4 KPI cards with trend change arrows.
  - **Historical vs Predicted Emissions** line chart (solid blue historical, dashed green forecast, shaded 95% confidence interval, present cutoff line).
  - **Usage Breakdown** donut chart.
  - **Predicted Emissions (Next 3 Months)** detailed quarterly forecast table with total card.
  - **Model Performance** card (Random Forest Regressor, MAE 0.42, RMSE 0.58, R² Score 0.94).
  - Actionable **Insights & Suggestions** list and hyperparameter configuration matrix.

- **Step 5: Dashboard (`/dashboard`)**
  - Date range picker (`Last 7 Days`, `Last 30 Days`, `Last 3 Months`).
  - 5 Summary KPI cards with category accents and % share.
  - Multi-line **Carbon Footprint Trend** chart with 7-day, 30-day, and 3-month toggle.
  - **Emissions Breakdown** donut chart with center statistic.
  - **Predicted Next Month** card with sparkline chart.
  - **Top Activities** table with color-coded horizontal progress bars.
  - **Personalized Recommendations** list with *Save X kg CO₂e* badges and interactive action application.
  - Motivational card: *“Small changes make a big impact”* with carbon budget progress bar and celebratory confetti!

- **Additional Styled Pages**:
  - **My Activities (`/activities`)**: Complete filterable log, search, and deletion controls.
  - **Recommendations (`/recommendations`)**: Full net-zero reduction roadmap with calculated active savings.
  - **Profile (`/profile`)**: Carbon budget target setting, regional grid intensity selector, and user telemetry options.

## 🛠 Tech Stack

- **React 19 + TypeScript**
- **Vite**
- **Tailwind CSS v4**
- **Recharts**
- **Lucide React**
- **Canvas Confetti**
- **Shared Global State Context** (synchronizing Pages 2, 3, 4, and 5)

## Automatic collection setup

An optional server backend now supports Google OAuth sign-in, a separate Google account storage quota permission, encrypted server-side OAuth tokens, and per-user SQLite records. Manual activity entry remains available. See [AUTOMATIC_TRACKING.md](./AUTOMATIC_TRACKING.md) for Google Cloud setup, environment variables, privacy details, and the metrics Google cannot provide.

For local development, start the API with `npm run api` in one terminal and the Vite frontend with `npm run dev` in another after configuring `.env`.

## 💻 Running the App

```bash
# Navigate to the project directory
cd C:\Users\Administrator\.gemini\antigravity\scratch\ecomind-app

# Install dependencies
npm install

# Start development server
npm run dev
```

Vite dev server runs at: `http://localhost:5173/`
