import os
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from dotenv import load_dotenv
import requests

# Load env variables
load_dotenv()

# Flask setup
app = Flask(__name__)
CORS(app)

# Grok / GROQ API setup
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise RuntimeError("❌ GROQ_API_KEY not found in environment")

# API endpoint (can override via env) - use Groq's OpenAI-compatible endpoint
# Note: previous default used 'grok' (typo) which causes SSL name mismatch errors.
GROK_API_URL = os.getenv("GROK_API_URL", "https://api.groq.com/openai/v1/chat/completions")
MODEL_NAME = os.getenv("GROK_MODEL", "llama-3.1-8b-instant")

# Store chat history in-memory
chat_history = {}

@app.route("/", methods=["GET"])
def home():
    return render_template('index.html')

def _extract_reply_from_response(resp):
    try:
        resp_json = resp.json()
    except Exception:
        resp_json = None

    bot_reply = None
    if isinstance(resp_json, dict):
        choices = resp_json.get("choices")
        if choices and isinstance(choices, list) and len(choices) > 0:
            first = choices[0]
            if isinstance(first, dict):
                msg = first.get("message") or first.get("content") or first
                if isinstance(msg, dict):
                    content = msg.get("content")
                    if isinstance(content, str):
                        bot_reply = content
                    elif isinstance(content, list):
                        parts = []
                        for p in content:
                            if isinstance(p, dict):
                                parts.append(p.get("text") or "")
                            else:
                                parts.append(str(p))
                        bot_reply = "".join(parts)
                elif isinstance(msg, str):
                    bot_reply = msg
        if not bot_reply:
            bot_reply = resp_json.get("reply") or resp_json.get("text")

    if not bot_reply:
        bot_reply = resp.text or ""

    return bot_reply


def handle_chat_data(data):
    try:
        message = data.get("message", "").strip()
        session_id = data.get("session_id", "default")

        if not message:
            return {"error": "Empty message"}, 400

        if session_id not in chat_history:
            chat_history[session_id] = []

        chat_history[session_id].append({"role": "user", "content": message})

        payload = {"model": MODEL_NAME, "messages": chat_history[session_id]}
        headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}

        resp = requests.post(GROK_API_URL, headers=headers, json=payload, timeout=15)
        bot_reply = _extract_reply_from_response(resp)

        chat_history[session_id].append({"role": "assistant", "content": bot_reply})

        return {"reply": bot_reply, "session_id": session_id}, 200

    except Exception as e:
        error_str = str(e)
        print("❌ Chat processing error:", e)
        if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str or "quota" in error_str.lower():
            fallback_reply = "⏱️ API quota limit reached for today. Please:\n\n1. **Wait 24 hours** for the quota to reset.\nFor now, this is a limitation of the free tier."
            try:
                chat_history.setdefault(session_id, []).append({"role": "model", "parts": [{"text": fallback_reply}]})
            except Exception:
                pass
            return {"reply": fallback_reply, "session_id": session_id}, 200
        return {"error": str(e)}, 500


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(force=True)
    resp, status = handle_chat_data(data)
    return jsonify(resp), status


@app.route("/api/chat", methods=["POST"])
def api_chat():
    data = request.get_json(force=True)
    resp, status = handle_chat_data(data)
    return jsonify(resp), status

@app.route("/reset", methods=["POST"])
def reset():
    data = request.get_json(force=True)
    session_id = data.get("session_id", "default")
    chat_history.pop(session_id, None)
    return jsonify({"message": "Chat reset successful"})

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy"})

if __name__ == "__main__":
    print("🚀 ChatNex backend started")
    print("🌐 http://127.0.0.1:5000")
    print(f"🤖 Model: {MODEL_NAME}")
    app.run(host="0.0.0.0", port=5000, debug=True)
