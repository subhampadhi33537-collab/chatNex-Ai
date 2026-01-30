// ============================================================================
// ChatNex - Main JavaScript
// Chat Storage & History Management
// ============================================================================

// ==== Elements ====
const input = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const chatbox = document.getElementById('chatbox');
const header = document.getElementById('pageHeader');
const greeting = document.getElementById('greeting');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const newChatBtn = document.getElementById('newChatBtn');
const chatHistory = document.getElementById('chatHistory');

// ==== Backend URL ====
const BACKEND_URL = "http://localhost:5000/chat";

// ==== Chat Storage ====
const STORAGE_KEY = 'chatnex_chats';
const CURRENT_CHAT_KEY = 'chatnex_current_chat';

let chats = [];
let currentChatId = null;

// ==== Initialize ====
function init() {
    loadChats();
    loadCurrentChat();
    renderChatHistory();
    setupEventListeners();
    
    // If there's a current chat, load it
    if (currentChatId) {
        loadChat(currentChatId);
    }
}

// ==== Chat Storage Functions ====
function loadChats() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            chats = JSON.parse(stored);
        } catch (e) {
            console.error('Error loading chats:', e);
            chats = [];
        }
    } else {
        chats = [];
    }
}

function saveChats() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
}

function loadCurrentChat() {
    const stored = localStorage.getItem(CURRENT_CHAT_KEY);
    if (stored) {
        currentChatId = stored;
    } else {
        createNewChat();
    }
}

function saveCurrentChat() {
    if (currentChatId) {
        localStorage.setItem(CURRENT_CHAT_KEY, currentChatId);
    }
}

function createNewChat() {
    const chatId = 'chat_' + Date.now();
    const newChat = {
        id: chatId,
        title: 'New Chat',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    chats.unshift(newChat);
    currentChatId = chatId;
    saveChats();
    saveCurrentChat();
    renderChatHistory();
    
    // Clear UI
    chatbox.innerHTML = '';
    chatbox.classList.remove('active');
    chatbox.setAttribute('aria-hidden', 'true');
    header.classList.remove('hidden');
    greeting.classList.remove('hidden');
    
    return chatId;
}

function getCurrentChat() {
    if (!currentChatId) return null;
    return chats.find(chat => chat.id === currentChatId);
}

function updateChatTitle(firstMessage) {
    const chat = getCurrentChat();
    if (chat && chat.messages.length === 1) {
        // Use first user message as title (max 50 chars)
        chat.title = firstMessage.substring(0, 50) + (firstMessage.length > 50 ? '...' : '');
        chat.updatedAt = new Date().toISOString();
        saveChats();
        renderChatHistory();
    }
}

function saveMessage(sender, text) {
    const chat = getCurrentChat();
    if (!chat) {
        createNewChat();
        return saveMessage(sender, text);
    }
    
    chat.messages.push({
        sender: sender,
        text: text,
        timestamp: new Date().toISOString()
    });
    
    chat.updatedAt = new Date().toISOString();
    saveChats();
}

function loadChat(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;
    
    currentChatId = chatId;
    saveCurrentChat();
    
    // Clear chatbox
    chatbox.innerHTML = '';
    
    // Load messages
    if (chat.messages.length > 0) {
        revealChatbox();
        chat.messages.forEach(msg => {
            addMessage(msg.sender, msg.text, false, false);
        });
    } else {
        chatbox.classList.remove('active');
        chatbox.setAttribute('aria-hidden', 'true');
        header.classList.remove('hidden');
        greeting.classList.remove('hidden');
    }
    
    renderChatHistory();
}

function deleteChat(chatId) {
    if (confirm('Are you sure you want to delete this chat?')) {
        chats = chats.filter(chat => chat.id !== chatId);
        saveChats();
        
        if (currentChatId === chatId) {
            if (chats.length > 0) {
                loadChat(chats[0].id);
            } else {
                createNewChat();
            }
        } else {
            renderChatHistory();
        }
    }
}

// ==== Render Chat History ====
function renderChatHistory() {
    if (chats.length === 0) {
        chatHistory.innerHTML = '<div class="chat-history-empty">No chat history yet</div>';
        return;
    }
    
    chatHistory.innerHTML = chats.map(chat => {
        const isActive = chat.id === currentChatId;
        const date = new Date(chat.updatedAt);
        const timeStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        return `
            <div class="chat-history-item ${isActive ? 'active' : ''}" data-chat-id="${chat.id}">
                <div class="chat-history-item-icon">💬</div>
                <div class="chat-history-item-text" title="${chat.title}">
                    <div style="font-weight: ${isActive ? '600' : '400'}">${chat.title}</div>
                    <div style="font-size: 0.75rem; color: var(--text-tertiary); margin-top: 2px;">${timeStr}</div>
                </div>
                <button class="chat-history-item-delete" data-chat-id="${chat.id}" aria-label="Delete chat">
                    🗑️
                </button>
            </div>
        `;
    }).join('');
    
    // Add click listeners for chat items
    chatHistory.querySelectorAll('.chat-history-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('chat-history-item-delete') && 
                !e.target.closest('.chat-history-item-delete')) {
                const chatId = item.getAttribute('data-chat-id');
                loadChat(chatId);
            }
        });
    });
    
    // Add click listeners for delete buttons
    chatHistory.querySelectorAll('.chat-history-item-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const chatId = btn.getAttribute('data-chat-id');
            deleteChat(chatId);
        });
    });
}

// ==== Helper: Format Markdown to HTML ====
function formatMessage(text) {
    if (!text) return '';
    // Bold: **text**
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic: *text*
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Line breaks
    formatted = formatted.replace(/\n/g, '<br>');
    return formatted;
}

// ==== Helper: Add message bubbles ====
function addMessage(sender, text, isTyping = false, saveToStorage = true) {
    const msg = document.createElement('div');
    msg.className = `msg ${sender}`;

    // Emoji for sender
    const emoji = sender === 'bot' ? '🤖' : '😎';

    // Parse markdown for bot messages
    const content = sender === 'bot' ? formatMessage(text) : text;

    msg.innerHTML = `<div class="bubble ${sender}-bubble">${emoji} ${content}</div>`;

    // Typing indicator styling
    if (isTyping && sender === 'bot') {
        msg.classList.add('typing');
    }

    chatbox.appendChild(msg);
    chatbox.scrollTop = chatbox.scrollHeight;
    
    // Save to storage
    if (saveToStorage) {
        saveMessage(sender, text);
    }
    
    return msg;
}

// ==== Reveal chat UI after first message ====
function revealChatbox() {
    header.classList.add('hidden');
    greeting.classList.add('hidden');
    chatbox.classList.add('active');
    chatbox.setAttribute('aria-hidden', 'false');

    setTimeout(() => chatbox.scrollTop = chatbox.scrollHeight, 120);
}

// ==== Send message to backend ====
async function sendMessage() {
    const message = input.value.trim();
    if (!message) return;

    // Create new chat if needed
    if (!currentChatId || !getCurrentChat()) {
        createNewChat();
    }

    // Reveal chatbox on first message
    if (!chatbox.classList.contains('active')) {
        revealChatbox();
    }

    // Show user message
    addMessage('user', message);
    
    // Update title if this is the first message
    const chat = getCurrentChat();
    if (chat && chat.messages.length === 1) {
        updateChatTitle(message);
    }
    
    input.value = '';
    sendBtn.disabled = true;
    input.disabled = true;

    // Show bot typing indicator
    const typingMsg = addMessage('bot', 'Typing...', true, false);

    try {
        // Timeout-safe fetch
        const controller = new AbortController();
        const timeoutMs = 20000; // 20 sec
        const timeout = setTimeout(() => controller.abort(), timeoutMs);

        const res = await fetch(BACKEND_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message }),
            signal: controller.signal
        });
        clearTimeout(timeout);

        let data = {};
        const text = await res.text();
        try { 
            data = JSON.parse(text); 
        } catch { 
            data = { error: "Invalid JSON from server", raw: text }; 
        }

        // Remove typing indicator
        typingMsg.remove();

        // Handle different errors
        if (res.status === 429) {
            addMessage('bot', "⚠️ API quota exceeded. Please wait or try tomorrow.");
        } else if (res.ok && data.reply) {
            addMessage('bot', data.reply);
        } else {
            addMessage('bot', "⚠️ " + (data.error || `Server error: ${res.status} ${res.statusText}`));
        }

    } catch (err) {
        typingMsg.remove();
        if (err.name === 'AbortError') {
            addMessage('bot', "⚠️ Request timed out. Backend may be waking up.");
        } else {
            addMessage('bot', "⚠️ Network error: " + (err.message || err));
        }
    } finally {
        sendBtn.disabled = false;
        input.disabled = false;
        input.focus();
    }
}

// ==== Setup Event Listeners ====
function setupEventListeners() {
    // Send button
    sendBtn.addEventListener('click', sendMessage);
    
    // Enter key in input
    input.addEventListener('keypress', e => { 
        if (e.key === 'Enter') sendMessage(); 
    });
    
    // Focus input on load
    window.addEventListener('load', () => input.focus());
    
    // New chat button
    newChatBtn.addEventListener('click', () => {
        createNewChat();
        input.focus();
    });
    
    // Sidebar toggle (desktop)
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }
    
    // Mobile menu toggle
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
        });
    }
    
    // Close mobile sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            if (sidebar.classList.contains('mobile-open') && 
                !sidebar.contains(e.target) && 
                !mobileMenuToggle.contains(e.target)) {
                sidebar.classList.remove('mobile-open');
            }
        }
    });
}

// ==== Initialize on load ====
init();
