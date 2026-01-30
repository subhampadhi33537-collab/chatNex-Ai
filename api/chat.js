// Vercel serverless function to proxy chat requests to Groq API
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { message, session_id = 'default', history } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Empty message' });
    }

    // Convert client-side history to OpenAI/Groq message format if provided
    let messages = Array.isArray(history) ? history.map(m => ({ role: m.role, content: m.content })) : [];
    messages.push({ role: 'user', content: message });

    const payload = {
      model: process.env.GROK_MODEL || 'llama-3.1-8b-instant',
      messages: messages
    };

    const grokUrl = process.env.GROK_API_URL || 'https://api.groq.com/openai/v1/chat/completions';
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'GROQ_API_KEY not configured' });

    const grokResp = await fetch(grokUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      // No timeout here; Vercel function has execution limits
    });

    const grokJson = await grokResp.json().catch(() => null);

    // Robust reply extraction (similar logic to previous Python implementation)
    let bot_reply = '';
    if (grokJson && typeof grokJson === 'object') {
      const choices = grokJson.choices;
      if (Array.isArray(choices) && choices.length > 0) {
        const first = choices[0];
        let msg = first.message || first.content || first;
        if (msg && typeof msg === 'object') {
          const content = msg.content;
          if (typeof content === 'string') bot_reply = content;
          else if (Array.isArray(content)) bot_reply = content.map(p => (typeof p === 'object' ? (p.text || '') : String(p))).join('');
        } else if (typeof msg === 'string') {
          bot_reply = msg;
        }
      }
      if (!bot_reply) bot_reply = grokJson.reply || grokJson.text || '';
    }

    if (!bot_reply) bot_reply = (await grokResp.text()) || '';

    return res.status(200).json({ reply: bot_reply, session_id });

  } catch (err) {
    console.error('chat function error:', err);
    return res.status(500).json({ error: String(err) });
  }
}
