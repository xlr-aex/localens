# 🌍📍 LocaLens

> **AI-Powered Geospatial Intelligence (GEOSINT)**

**LocaLens** leverages **Google Gemini 2.5** to pinpoint image locations with forensic precision. It employs the unique "Host & Anchor" protocol to verify architectural fingerprints against satellite data, simulating expert Geoguessr reasoning to avoid common AI hallucinations.

---

## ✨ Key Features

*   **🧠 Multi-Hypothesis Reasoning**: Generates top 3 probable locations with confidence scores and detailed deduction trails.
*   **🛡️ "Host & Anchor" Protocol**: A strict verification system that cross-references specific buildings against their neighbors to prevent "franchise traps" (e.g., guessing a generic Starbucks).
*   **🔍 Visual Evidence Scanning**: Identifies specific road markings, vegetation types, and urban furniture (bollards, plates).
*   **🗺️ Dual-View Verification**: Displays results on OpenStreetMap alongside an interactive Google Street View window for instant confirmation.

## 🛠️ Tech Stack

![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Gemini API](https://img.shields.io/badge/Google_Gemini_2.5-8E75B2?style=flat-square&logo=google&logoColor=white)

## 🚀 Quick Start

**Prerequisites**: Node.js installed.

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Configure Environment**
    Ensure your `API_KEY` (Google Gemini) is set in your environment variables.

3.  **Run Locally**
    ```bash
    npm run dev
    ```

## 📄 License

**MIT License** — Open source & permissive.

Copyright (c) 2025 LocaLens Contributors. See [LICENSE](./LICENSE) for full text.
