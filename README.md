# 🎙️ LokVani AI (LokVani.AI)
> **Inclusive, Voice-First & Trust-Verified Intelligence for Bharat's Farmers & Micro-Vendors**

Built for the **AI for Public Good** track at OOSC Hackathon.

---

## 🌟 Overview

Over 500 million non-smartphone users and underserved citizens in India are excluded from current AI advances because existing LLMs rely on complex apps, high text literacy, and top-down static data — while direct AI voice bots risk hallucinating critical financial or agricultural advice.

**LokVani AI** solves this with a **three-tier architecture**:
1. **Voice-First User App (Web Speech STT/TTS):** Speak queries naturally in Hindi or English without typing or complex menus.
2. **Kirana Trust Node Dashboard (Human-in-the-Loop Edge Verifier):** High-stakes queries (e.g. government scheme eligibility, loan paperwork, or chemical pesticide dosage) are automatically flagged and routed to a local Kirana store owner or CSC operator for 1-click verification before final release.
3. **Community Intelligence Network ("Waze for Rural Micro-Economies"):** Crowdsourced real-time Mandi commodity rates and local weather alerts reported by neighboring farmers to give hyper-local insights.

---

## 🚀 Key Features

* **🎙️ Zero-Barrier Voice Interface:** Dynamic pulsating microphone button with real-time waveform animation using browser-native Web Speech STT/TTS.
* **🛡️ Smart High-Stakes Risk Classifier:** Gemini 1.5 Flash AI automatically tags queries as `AUTO_VERIFIED` or `PENDING_TRUST_REVIEW`.
* **🏪 Kirana Operator Review Hub:** 1-click approve, modify, or add verified voice notes to AI drafts.
* **📈 Real-Time Mandi Commodity Feed:** Crowdsourced prices for Tomatoes, Onions, Potatoes, Wheat, and Rice with location tags and trend indicators.
* **⚡ Instant Pitch Demo Presets:** Pre-loaded audio presets for seamless live venue demonstrations.

---

## 🛠️ Tech Stack & Constraints

* **Frontend:** React 18 + Vite
* **Styling:** Custom Vanilla CSS (Design Tokens, Glassmorphism Dark Mode)
* **Voice Engine:** Web Speech API (`SpeechRecognition` & `SpeechSynthesis`)
* **AI Engine:** Google Gemini 1.5 Flash API (`@google/generative-ai`) + Smart Offline Fallback Engine
* **Icons:** Lucide React Icons

---

## 💻 Local Setup & Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SairajTripathy-0077/OOSC-Hackathon.git
   cd OOSC-Hackathon
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **(Optional) Add your Gemini API Key:**
   Create a `.env` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *(Note: If no API key is provided, LokVani AI uses its built-in offline smart reasoning engine).*

4. **Run local dev server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## 📜 License & Track Info

Built with ❤️ for **AI for Public Good** 
