# 🚀 Send It AI: The Ultimate LinkedIn Lead Machine

**Extract leads directly from LinkedIn posts with a single click—powered by Local & Cloud AI.**

"Send It AI" is a powerful Chrome Extension designed for recruiters, sales teams, and networkers who are tired of manual data entry. Whether you're at your desk or on the move, Send It AI turns messy LinkedIn posts into clean, actionable leads in your Google Sheets.

![Send It AI Header](https://raw.githubusercontent.com/GauravFrontend/sendit/main/icons/icon128.png)

---

## ✨ Features that WOW
*   **🧠 Hybrid Intelligence**: Uses **Ollama (Local)** for free, private extraction when your laptop is on, and falls back to **Groq Cloud** (Llama 3.3 70B) when you're offline.
*   **🎯 One-Click Extraction**: Select any text on LinkedIn, hit the floating icon, and watch as AI identifies names, emails, phones, and locations instantly.
*   **📊 Direct Google Sheets Sync**: A sleek dashboard to manage your gathered leads and sync them to your master sheet with one click.
*   **🛡️ Duplicate Protection**: Smart email-matching ensures you never save the same person twice.
*   **☁️ Zero-Backend Mode**: Even if your server is offline, you can continue gathering leads using Cloud AI. Sync them later when you're back online!

---

## 🛠️ Setup Instructions

### 1. The Chrome Extension
1.  Open Chrome and go to `chrome://extensions/`.
2.  Enable **Developer Mode** (top right).
3.  Click **Load Unpacked** and select this folder.
4.  Open the extension popup and click **Cloud Settings** (+) to add your [Groq API Key](https://console.groq.com/keys).

### 2. The Backend (Optional for Local AI)
To use Ollama (Free Local AI) and enable Syncing:
1.  Ensure [Ollama](https://ollama.com/) is running locally with `qwen2.5:3b`.
2.  Navigate to `/backend` and run:
    ```bash
    npm install
    npm start
    ```
3.  Ensure your `ngrok` tunnel is pointing to your backend port.

### 3. Google Sheets Integration
1.  Share your Google Sheet with the `client_email` found in your `service-account.json`.
2.  Put your `GOOGLE_SHEET_ID` in the `backend/.env` file.

---

## 🚀 How to Use
1.  **Browse LinkedIn**: When you see a post with a lead, **select the text**.
2.  **Send to AI**: Click the floating purple icon.
3.  **Refine**: AI will fill out the Name, Email, and Phone. Fix anything if needed.
4.  **Add to List**: Hit "Add to List" to save it to your local browser storage.
5.  **Sync**: When you're ready, open the popup and hit **Sync** to push all your new leads to your Google Sheet!

---

## 💎 Why "Send It"?
*   **Privacy First**: Your data stays in your browser or on your local server.
*   **Speed**: Powered by Groq/Ollama for near-instant results.
*   **Robustness**: Built-in recovery—if your local backend goes down, Cloud AI takes over automatically.

---
*Built with ❤️ for high-speed lead generation.*
