# 🏥 MedCare Pharma

<div align="center">
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/TanStack_Start-FF4154?style=for-the-badge&logo=react&logoColor=white" alt="TanStack Start" />
</div>

<br />

**MedCare Pharma** is a next-generation AI-driven Supply Chain Control Tower designed to unify demand sensing, smart allocation, and autonomous procurement. By bridging the gap between proactive demand forecasting and reactive purchasing, MedCare Pharma ensures an optimized, resilient, and waste-free supply chain ecosystem for healthcare organizations.

---

## 🎯 Vision & Capabilities

The platform operates as a unified command center, integrating two major solutions into one connected ecosystem:

### 🧠 P1: Demand Sensing & Smart Allocation
- **AI-Powered Demand Intelligence:** Goes beyond historical trends by capturing and acting on real-world signals (e.g., flu seasons, promotional events) to accurately predict regional stock requirements.
- **Expiry-Aware Allocation:** Proactively identifies near-expiry pharmaceutical batches across Distribution Centers (DCs). It autonomously suggests inter-DC transfers to high-demand regions, actively mitigating financial waste and preventing localized stock-outs.
- **Dynamic Replenishment Planning:** Continuously recalculates safety stocks by integrating real-time demand forecasts with supplier lead times.

### ⚡ PR2: Autonomous Procure-to-Pay (P2P)
- **Smart Sourcing:** Features an intuitive conversational UI for raising material requisitions. The AI evaluates and ranks suppliers based on historical reliability, lead times, and current pricing.
- **Automated PO Generation:** Utilizes robust rule-based engines to automatically generate and dispatch purchase orders to vendors, reducing manual intervention.
- **Touchless 3-Way Match & Goods Receipt:** Simulates IoT/Computer Vision integration for goods receipt against OCR-extracted vendor invoices. This enables touchless payments and instant flagging of discrepancies (e.g., quantity mismatches, price variations).

### 🎛️ Unified AI Command Center
A centralized hub bringing all supply chain alerts into a single, actionable interface. Supply chain operators can execute complex, multi-step actions autonomously—such as `Transfer Stock -> Generate PO -> Change Supplier`—in a single click, or escalate critical alerts based on severity.

---

## 🚀 Tech Stack

MedCare Pharma leverages modern, high-performance web technologies:

- **Framework:** [TanStack Start](https://tanstack.com/start/latest) (React 19)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **State Management & Data Fetching:** [TanStack Query](https://tanstack.com/query)
- **Routing:** [TanStack Router](https://tanstack.com/router)
- **Database:** Local Zero-Config Database (seeded on startup via `better-sqlite3`)
- **Icons & Visualization:** [Lucide React](https://lucide.dev/) & [Recharts](https://recharts.org/)

---

## 🛠️ Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/en/) (v18.0.0 or higher)
- [npm](https://www.npmjs.com/) (v9.0.0 or higher)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Snehil1310/MedCare_Pharma.git
   cd MedCare_Pharma
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   Open your browser and navigate to `http://localhost:3000`. The local database will automatically initialize and seed itself on startup in the `data/` directory.

---

## 🏗️ Project Structure

```
MedCare_Pharma/
├── data/               # Local SQLite database and seed files
├── public/             # Static assets
├── src/                
│   ├── components/     # Reusable UI components (shadcn/ui)
│   ├── db/             # Database schemas and connection logic
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions and shared logic
│   ├── routes/         # TanStack Router route definitions
│   └── server-fns/     # Backend server functions/API endpoints
├── package.json        # Dependencies and scripts
└── vite.config.ts      # Vite configuration
```

---

## 🛡️ License

Proprietary — **MedCare Pharma**. All rights reserved.

<div align="center">
  <sub>Built with ❤️ for a smarter, healthier supply chain.</sub>
</div>
