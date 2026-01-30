# ChatNex AI Assistant

<div align="center">

![ChatNex](https://img.shields.io/badge/ChatNex-AI%20Assistant-green)
![Python](https://img.shields.io/badge/Python-3.9+-blue)
![Flask](https://img.shields.io/badge/Flask-2.3-orange)
![License](https://img.shields.io/badge/License-MIT-green)

**A sleek, responsive AI chatbot powered by Grok API and built with Flask**

[Features](#features) • [Tech Stack](#tech-stack) • [Installation](#installation) • [Deployment](#deployment) • [Usage](#usage)

</div>

---

## 🎯 Overview

**ChatNex** is a modern AI chatbot application that provides intelligent conversational responses using the **Grok API** (free tier). It features a beautiful green-themed UI with full mobile responsiveness, persistent chat history via localStorage, and seamless session management.

Perfect for integrating AI conversations into your project or as a standalone chatbot service.

---

## ✨ Features

- 🤖 **AI-Powered Responses** – Uses Grok's `llama-3.1-8b-instant` model for fast, intelligent replies
- 💬 **Persistent Chat History** – All conversations saved locally (browser localStorage)
- 📱 **Fully Mobile Responsive** – Optimized for desktop, tablet, and mobile devices
- 🎨 **Beautiful UI** – Green & white theme with smooth animations and transitions
- 🔐 **Secure API Integration** – API key stored in `.env` (never exposed)
- ⚡ **Fast & Lightweight** – Flask backend with in-memory session management
- 🚀 **Cloud Ready** – Deploy to Render in minutes with included `Procfile`
- 🌐 **CORS Enabled** – Ready for cross-origin requests

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| **Backend** | Python, Flask 2.3 |
| **API** | Grok API (OpenAI-compatible endpoint) |
| **Deployment** | Gunicorn, Render (free tier) |
| **Libraries** | requests, python-dotenv, flask-cors |

---

## 📋 Prerequisites

- Python 3.9+
- pip (Python package manager)
- A free **Grok API key** from [Grok Console](https://console.grok.ai)
- (Optional) Render account for hosting

---

## 🚀 Quick Start

### 1. Clone & Setup

```bash
git clone https://github.com/yourusername/ChatNex.git
cd ChatNex-Ai-assistant
```

### 2. Create Virtual Environment

```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# macOS/Linux
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_gsk_key_here
```

**Get your Grok API key:**
1. Visit [Grok Console](https://console.grok.ai)
2. Create an account or sign in
3. Generate a free API key (starts with `gsk_`)
4. Paste it into `.env`

### 5. Run Locally

```bash
python app.py
```

Open your browser to `http://localhost:5000` and start chatting! 🎉

---

## 📂 Project Structure

```
ChatNex-Ai-assistant/
├── app.py                      # Flask backend
├── requirements.txt            # Python dependencies
├── Procfile                    # Render deployment config
├── .env                        # Environment variables (git-ignored)
├── .gitignore                  # Git ignore rules
├── templates/
│   └── index.html              # Main UI
├── static/
│   ├── css/
│   │   ├── style.css           # Main stylesheet
│   │   ├── mobile.css          # Mobile optimizations
│   │   └── sidebar-mobile.css  # Sidebar refinements
│   ├── js/
│   │   └── main.js             # Client-side logic
│   └── icon/
│       └── chatnex.png         # App logo
└── README.md                   # This file
```

---

## 🔌 API Integration

### Grok API Details

- **Endpoint:** `https://api.groq.com/openai/v1/chat/completions`
- **Model:** `llama-3.1-8b-instant` (free, fast)
- **Auth:** Bearer token (from `.env`)
- **Format:** OpenAI-compatible

### Backend Flow

1. User sends message via `/chat` POST endpoint
2. Backend maintains session history in-memory
3. Grok API returns streaming/complete response
4. Response sent back to frontend
5. Frontend saves to localStorage for persistence

---

## 📱 UI Features

### Desktop Layout
- Full sidebar with chat history (280px)
- Collapsible sidebar (80px when collapsed)
- Full-width main content area
- Fixed input bar at bottom

### Mobile Layout
- Hidden sidebar (slides in from left on tap)
- Full-screen chat area
- Compact input bar with optimized touch targets
- Auto-closing sidebar on outside click

### Responsive Breakpoints
- **Desktop:** 769px+ (sidebar always visible)
- **Tablet:** 481px–768px (sidebar toggles)
- **Mobile:** 480px and below (optimized touch UI)

---

## ⚙️ Configuration

### Environment Variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `GROQ_API_KEY` | ✅ Yes | – | Grok API authentication |
| `GROK_API_URL` | ❌ No | `https://api.groq.com/openai/v1/chat/completions` | API endpoint |
| `GROK_MODEL` | ❌ No | `llama-3.1-8b-instant` | Model name |

### Backend Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/` | GET | Serve main UI |
| `/chat` | POST | Send message, get AI response |
| `/reset` | POST | Clear session history |
| `/health` | GET | Health check (for monitoring) |

---

## 🌐 Deployment on Render (Free Plan)

### Step-by-Step

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit: ChatNex AI Assistant"
   git push origin main
   ```

2. **Create Render Account**
   - Visit [Render Dashboard](https://dashboard.render.com)
   - Sign up with GitHub

3. **Create Web Service**
   - Click **New** → **Web Service**
   - Connect your GitHub repository
   - Select branch: `main`

4. **Configure Service**
   - **Name:** `chatnex-ai-assistant` (or your choice)
   - **Runtime:** Python 3.11
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app` (auto-detected from Procfile)

5. **Add Environment Variables**
   - Click **Environment**
   - Add key: `GROQ_API_KEY`
   - Paste your Grok API key
   - Click **Deploy**

6. **Access Your App**
   - Once deployed, visit: `https://chatnex-ai-assistant.onrender.com`
   - Share the URL!

### Cost Estimate
- **Free Plan:** $0/month (includes 750 compute hours)
- **Pro Plan:** $7/month (unlimited hours)

> **Note:** Free instances spin down after 15 minutes of inactivity. First request may take 30 seconds to wake up.

---

## 🔒 Security Notes

- ✅ Never commit `.env` to Git (already in `.gitignore`)
- ✅ API key validated on backend only (not exposed to frontend)
- ✅ Session data stored in-memory (not persisted on disk)
- ✅ CORS enabled for same-origin requests only

---

## 🧪 Testing

### Local Testing

```bash
# Start the server
python app.py

# In another terminal, test the chat endpoint
curl -X POST http://localhost:5000/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello Grok!"}'
```

### Expected Response
```json
{
  "reply": "Hello! How can I assist you today?",
  "session_id": "default"
}
```

---

## 🐛 Troubleshooting

### Issue: "GROQ_API_KEY not found"
**Solution:** Create `.env` file with your API key:
```bash
export GROQ_API_KEY=your_key_here  # macOS/Linux
set GROQ_API_KEY=your_key_here     # Windows CMD
```

### Issue: SSL/TLS errors on Windows
**Solution:** Upgrade certificates:
```bash
pip install --upgrade requests certifi pyOpenSSL urllib3
```

### Issue: Slow responses on Render
**Solution:** Free plan instances are slower. Upgrade to Pro for guaranteed performance, or keep the app warm by pinging `/health`.

### Issue: Chat history lost after refresh
**Solution:** This is expected—localStorage only persists between sessions in the same browser.

---

## 📈 Future Enhancements

- [ ] Database integration (persistent server-side storage)
- [ ] User authentication & multi-user support
- [ ] Chat export (PDF/JSON)
- [ ] Rate limiting & usage analytics
- [ ] Support for multiple AI models
- [ ] Voice input/output
- [ ] Dark mode toggle

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 💬 Support

Have questions? Need help?
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/ChatNex/issues)
- 💡 Discussions: [GitHub Discussions](https://github.com/yourusername/ChatNex/discussions)

---

<div align="center">

**Made with ❤️ by ChatNex Contributors**

⭐ If you found this helpful, please star the repo!

</div>
#   c h a t N e x - A i  
 