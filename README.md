# MedCare Pharma: AI Supply Chain Control Tower

![MedCare Pharma](https://img.shields.io/badge/Status-Active-success) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white) ![TanStack](https://img.shields.io/badge/TanStack%20Start-FF4154?style=flat&logo=react&logoColor=white)

MedCare Pharma is a unified AI Supply Chain platform encompassing two major solutions: **P1 Demand Sensing & Replenishment** and **PR2 Autonomous Procure-to-Pay**. 

The Control Tower integrates all modules into one connected ecosystem, bridging the gap between demand forecasting and automated procurement.

---

## 🌟 Core Modules

### 1. P1 — Demand Sensing & Smart Allocation
- **Demand Intelligence:** AI-driven forecasting overriding historical trends by capturing signals (e.g., flu season, promotions) to actively predict stock requirements.
- **Expiry-Aware Allocation:** Automatically detect near-expiry batches across Distribution Centers (DCs) and suggest transfers to high-demand regions, actively preventing financial waste and stock-outs.
- **Replenishment Planning:** Autonomous safety stock calculation integrating demand forecasts and supplier lead times.

### 2. PR2 — Autonomous Procure-to-Pay (P2P)
- **Smart Sourcing:** Conversational UI to quickly raise material requisitions. AI compares suppliers based on reliability, lead time, and price.
- **Autonomous PO Generation:** Rule-based purchase orders automatically sent to vendors.
- **3-Way Match & Goods Receipt:** Simulates IoT/CV goods-receipt integration against OCR-extracted invoices to enable touchless payments and instant exception flagging.

### 3. Unified AI Command Center
A centralized hub bringing all alerts into one actionable interface. Supply chain teams can execute complex, multi-step actions (e.g., Transfer Stock -> Generate PO -> Change Supplier) autonomously in a single click, or escalate appropriately based on alert severity.

---

## 🚀 Tech Stack

- **Framework:** [TanStack Start](https://tanstack.com/start/latest) (React)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Data Fetching:** [TanStack Query](https://tanstack.com/query)
- **Database:** SQLite via [`better-sqlite3`](https://github.com/WiseLibs/better-sqlite3) (Zero-config local database seeded on startup)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## 🛠️ Quick Start

### Prerequisites
- Node.js (v18+)

### Installation
Clone the repository and install dependencies:

```bash
git clone <your-github-repo-url>
cd medcare-pharma
npm install
```

### Running Locally
To run the development server:

```bash
npm run dev
```

The app will instantly be available at `http://localhost:3000`. 
*(Note: The database automatically initializes and seeds itself on startup in the `data/` folder).*

---

## 🛡️ License
Proprietary — MedCare Pharma.
