# 🦥 Sloth DA Estimator

> A Data Availability (DA) cost estimation tool built for the **CelestineSloths** community.
> Elegant, precise, and as stable as a sloth.

![License](https://img.shields.io/badge/license-MIT-amber)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8)

---

## 📖 Project Overview

**Sloth DA Estimator** is an intuitive web application designed to help developers and users compare in real-time the cost differences of publishing data on **Ethereum (EIP-4844 Blob)** versus **Celestia**.

This project adopts a frontend-backend separation architecture (Next.js App Router), ensuring API Key security while achieving optimal access speed and API call optimization through multiple caching mechanisms.

### ✨ Core Features

- **🦥 Immersive Sloth Theme**: Full-screen frosted glass loading page with warm brown and amber color scheme for a comfortable UI design.
- **⚡ Real-time Price Tracking**: Backend automatically fetches real-time prices for ETH and TIA as well as Gas fee rates.
- **🛡️ Five-Tier Data Source Backup**: Enterprise-grade API disaster recovery strategy, attempting in order: `Binance` → `OKX` → `Gate.io` → `KuCoin` → `CoinCap`, ensuring the service never goes offline.
- **🌊 Smart Anti-Flood Caching**:
  - **Browser Level**: `Cache-Control` strong caching to prevent frequent user refreshes.
  - **Server Level**: Vercel Serverless Function 2-minute (`revalidate`) caching to protect upstream APIs.
- **🎚️ Flexible Unit Conversion**: Supports smooth switching and estimation between KB (max 2048) and MB (max 128) modes.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Deployment**: Vercel Serverless Functions

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/YourUsername/sloth-da-estimator.git
cd sloth-da-estimator
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Background Image

Please ensure you place a background image of your choice in the `public/` directory and name it `bg.jpg`.

### 4. Run Locally

```bash
npm run dev
```

Open your browser and visit `http://localhost:3000` to see the application in action.

---

## 📂 Project Structure

```
.
├── app/
│   ├── api/market-data/route.ts  # Backend API (with five-tier backup and caching logic)
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Layout file
│   └── page.tsx                  # Frontend main interface (React component)
├── public/
│   └── bg.jpg                    # Background image (required)
├── README.md
└── package.json
```

---

## 🌐 Deployment Guide (Vercel)

This project is deeply optimized for Vercel, making deployment extremely simple:

1. Push your code to GitHub.
2. Log in to Vercel.
3. Click **New Project** and import your GitHub repository.
4. Keep the default settings and click **Deploy**.
5. Wait about 1 minute, and your Sloth calculator will be live! 🎉

---

## 🤝 Contributing & Community

This project is maintained by the **CelestineSloths Community**.

If you have great ideas or find bugs, feel free to submit Issues or Pull Requests. Let's build amazing Web3 tools together!

- **Twitter**: [@CelestineSloths](https://x.com/CelestineSloths)
- **Discord**: [Join our Server](https://discord.gg/EfSaAtZH)

---

Made with 🧡 by the Sloths.
