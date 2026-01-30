# ChatNex AI Agent Instructions

## Architecture Overview

**ChatNex** is a Flask-based AI chatbot frontend that integrates with the Grok API for conversation capabilities. The app uses a session-based architecture with persistent local storage for chat history.

### Core Stack
- **Backend**: Flask + python-dotenv, requests, CORS
- **Frontend**: Vanilla JS (ES6+), HTML5, CSS3 with design tokens
- **API Integration**: Grok (`grok-1.0-mini` model via `https://api.grok.ai/v1/chat`)
- **Data Persistence**: Browser localStorage (not persistent server-side)

### Key Components

1. **[app.py](app.py)** - Flask backend server
   - Routes: `GET /`, `POST /chat`, `POST /reset`, `GET /health`
   - Session management via in-memory `chat_sessions` dict (lost on restart)
   - Grok API payload: `{"model": "grok-1.0-mini", "messages": [...]}`
   - Error handling: Timeouts (504), malformed requests (400), server errors (500)

2. **[static/js/main.js](static/js/main.js)** - Client-side chat logic
   - Storage: Uses localStorage with keys `chatnex_chats` (all chats) and `chatnex_current_chat` (active chat ID)
   - Chat object structure: `{id, title, messages: [{sender, text, timestamp}], createdAt, updatedAt}`
   - Message flow: User input → backend → Grok API → response → localStorage
   - Markdown formatting: Supports `**bold**` and `*italic*` parsing to HTML

3. **[templates/index.html](templates/index.html)** - UI scaffold
   - Layout: Sidebar (chat history) + Main content (chatbox + input)
   - Accessibility: ARIA labels, semantic HTML, live regions for chat
   - Mobile-responsive: Uses sidebar toggling (`collapsed`/`mobile-open` classes)

4. **[static/css/style.css](static/css/style.css)** - Design system
   - Theme: Green & white (primary: `#22c55e`)
   - CSS variables for all colors, spacing, typography, z-index
   - Responsive breakpoints: 768px (desktop/mobile threshold)

---

## Critical Developer Workflows

### Setup & Running
```bash
pip install -r requirements.txt
export GROK_API_KEY="your_key_here"  # or set in .env
python app.py
# Opens on http://localhost:5000
```

### Environment Configuration
- **Required**: `GROK_API_KEY` env var (fails at startup if missing)
- **Optional**: `.env` file with `GROK_API_KEY=...` (loaded via python-dotenv)
- **Backend URL** (frontend): Hardcoded to `https://chatnex-ai-assistant.onrender.com/chat` in [main.js:21](static/js/main.js#L21) — update for local dev

### Testing Chat Flow
1. `POST /chat` expects: `{"message": "...", "session_id": "optional"}`
2. Response format: `{"reply": "...", "session_id": "..."}`
3. Backend maintains in-memory context (lost on restart — design limitation)
4. Frontend persists only client-side (localStorage)

### Debugging Common Issues
- **API quota exhausted**: Frontend shows "⚠️ API quota exceeded" (429 status)
- **Timeout**: Frontend detects AbortError after 20s, shows "Request timed out"
- **Invalid JSON from backend**: Error handler catches and displays raw response
- **Lost session on refresh**: Expected — backend sessions are in-memory only

---

## Project-Specific Patterns & Conventions

### Message Handling
- **User messages**: Stored as `{sender: "user", text, timestamp}`
- **Bot replies**: Formatted with markdown → HTML (bold/italic only)
- **Typing indicator**: Transient message with `.typing` class, removed after API response
- **Emojis**: Bot messages prefixed with 🤖, user with 😎

### Chat Storage Structure
```javascript
// Single chat object in localStorage["chatnex_chats"]
{
  id: "chat_1234567890",        // timestamp-based ID
  title: "First 50 chars...",   // auto-set from first user message
  messages: [{sender, text, timestamp}],
  createdAt: "ISO-8601",
  updatedAt: "ISO-8601"
}
```

### UI State Management
- **Greeting hidden**: `.hidden` class added to header/greeting when first message sent
- **Chatbox activation**: `.active` class + `aria-hidden="false"` on first message
- **Sidebar mobile mode**: `.mobile-open` class (toggle on small screens)
- **Chat selection**: Active chat marked with `.active` class in history list

### CSS Design Token System
All colors/spacing defined as CSS variables (`:root`). Examples:
- `--color-primary: #22c55e` (green theme)
- `--spacing-4: 1rem` (standard padding)
- `--transition-base: 250ms` (default animation duration)
- `--sidebar-width: 280px` (layout constant)

No hardcoded colors or spacing values in component styles — use tokens.

---

## Integration Points & External Dependencies

### Grok API Integration ([app.py:53-67](app.py#L53-L67))
```python
payload = {
    "model": "grok-1.0-mini",
    "messages": chat_sessions[session_id] + [{"role": "user", "content": user_message}]
}
headers = {"Authorization": f"Bearer {GROK_API_KEY}", "Content-Type": "application/json"}
response = requests.post(GROK_API_URL, headers=headers, json=payload, timeout=10)
```
- **Timeout**: 10 seconds (backend)
- **Message format**: OpenAI-compatible (role/content)
- **Model**: `grok-1.0-mini` (fast, free-tier friendly)
- **Known issue**: `GROK_API_URL` hardcoded to test endpoint — likely needs replacement

### Frontend-Backend Communication
- **Base URL**: Hardcoded in `main.js` (search for `BACKEND_URL`)
- **Method**: POST JSON with `{"message": "..."}`
- **Timeout**: 20 seconds client-side, AbortController-based
- **CORS**: Enabled via `flask_cors.CORS(app)`

### localStorage Keys
- `chatnex_chats` - serialized array of all chat objects
- `chatnex_current_chat` - ID of active chat
- Loss of these keys = loss of all chat history (no server backup)

---

## When Modifying Code

### Adding Features
1. **Backend endpoint**: Add route to [app.py](app.py), follow existing error patterns (400/500)
2. **Frontend event**: Add listener in `setupEventListeners()` in [main.js](static/js/main.js)
3. **UI styling**: Use CSS variables, add classes following `--class-name` BEM-ish pattern
4. **Persistence**: If data needs to survive restart, migrate to server-side storage (session management limitation)

### Common Pitfalls
- **Session loss**: In-memory sessions don't persist across server restarts — mention in docs
- **Mobile responsiveness**: Test at 768px breakpoint; sidebar behavior changes
- **CORS**: Required for API calls; if adding external APIs, update Flask-CORS config
- **localStorage quota**: 5-10MB typical; large chat histories may fail silently
- **Markdown parsing**: Currently only supports `**bold**` and `*italic*` — extending needs regex updates

---

## Summary
ChatNex is a stateless frontend + ephemeral backend chatbot. Strength: simple, fast, client-controlled history. Limitation: no persistent server-side sessions. Grok API integration requires valid key and endpoint verification. All styling uses design tokens; frontend routes hardcoded (environment-dependent).
